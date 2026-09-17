import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { isValidObjectId, type Model } from "mongoose";
import { Account } from "../auth/auth.models";
import {
  Application,
  ContentRecord,
  ContentKind,
  Profile,
  SavedList,
  Contact,
  contentKinds,
  Media,
} from "./platform.models";
import {
  ApplicationDto,
  ApplicationUpdateDto,
  ContentDto,
  ProfileDto,
  ListDto,
  UserUpdateDto,
  ContactDto,
} from "./platform.dto";
import { MailService } from "../mail/mail.service";
import { ConfigService } from "@nestjs/config";
export function profileCompletion(profile: Partial<Profile>) {
  const values = [
    profile.bio,
    profile.city,
    profile.profession,
    profile.skills?.length,
    profile.languages?.length,
    profile.experience,
    profile.availability,
    profile.photo,
    profile.portfolio?.length,
    profile.showreel,
  ];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}
export function escapeSearch(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
@Injectable()
export class PlatformService {
  constructor(
    @InjectModel("Content") readonly content: Model<ContentRecord>,
    @InjectModel("Profile") readonly profiles: Model<Profile>,
    @InjectModel("Application") readonly applications: Model<Application>,
    @InjectModel("SavedList") readonly lists: Model<SavedList>,
    @InjectModel("Contact") readonly contacts: Model<Contact>,
    @InjectModel("Account") readonly accounts: Model<Account>,
    @InjectModel("Media") readonly media: Model<Media>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}
  private kind(kind: string) {
    if (!(contentKinds as readonly string[]).includes(kind))
      throw new NotFoundException("Content type not found.");
    return kind as ContentKind;
  }
  private id(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException("Record not found.");
    return id;
  }
  async listContent(kind: string, admin = false) {
    this.kind(kind);
    return this.content
      .find({
        kind: this.kind(kind),
        ...(admin ? {} : { published: true, archived: false }),
      })
      .sort({ order: 1, createdAt: -1 })
      .limit(200)
      .lean();
  }
  async contentItem(kind: string, slug: string) {
    this.kind(kind);
    const item = await this.content
      .findOne({
        kind: this.kind(kind),
        slug,
        published: true,
        archived: false,
      })
      .lean();
    if (!item) throw new NotFoundException("Content not found.");
    return item;
  }
  async ownedMedia(userId: string, values: (string | undefined)[]) {
    for (const value of values.filter(Boolean) as string[]) {
      const match = value.match(
        /^\/api\/v1\/media\/([a-f0-9]{24})\/(thumb|profile|medium|large|document)$/,
      );
      if (
        !match ||
        !(await this.media.exists({ _id: match[1], ownerId: userId }))
      )
        throw new BadRequestException("Use media uploaded to your account.");
    }
  }
  async saveContent(
    kind: string,
    input: ContentDto,
    userId: string,
    id?: string,
  ) {
    this.kind(kind);
    if (
      input.ageMin !== undefined &&
      input.ageMax !== undefined &&
      input.ageMin > input.ageMax
    )
      throw new BadRequestException("Minimum age cannot exceed maximum age.");
    if (
      input.data &&
      (Object.keys(input.data).length > 60 ||
        Object.entries(input.data).some(
          ([key, value]) =>
            !/^[a-zA-Z][a-zA-Z0-9_]{0,60}$/.test(key) ||
            typeof value !== "string" ||
            value.length > 10000,
        ))
    )
      throw new BadRequestException(
        "Settings values must be short named text fields.",
      );
    await this.ownedMedia(userId, [input.image, ...(input.images ?? [])]);
    if (
      input.projectId &&
      !(await this.content.exists({ _id: input.projectId, kind: "projects" }))
    )
      throw new BadRequestException("Project not found.");
    try {
      const record = id
        ? await this.content.findOneAndUpdate(
            { _id: this.id(id), kind: this.kind(kind) },
            { $set: input },
            { new: true, runValidators: true },
          )
        : await this.content.create({ ...input, kind: this.kind(kind) });
      if (!record) throw new NotFoundException("Content not found.");
      return record;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      )
        throw new ConflictException("This URL slug is already in use.");
      throw error;
    }
  }
  async archiveContent(kind: string, id: string) {
    this.kind(kind);
    const record = await this.content.findOneAndUpdate(
      { _id: this.id(id), kind: this.kind(kind) },
      { archived: true, published: false },
      { new: true },
    );
    if (!record) throw new NotFoundException();
    return record;
  }
  async profile(userId: string) {
    const profile = await this.profiles.findOne({ userId }).lean();
    return { ...profile, userId, completion: profileCompletion(profile ?? {}) };
  }
  async saveProfile(userId: string, input: ProfileDto) {
    if (input.birthDate && new Date(input.birthDate) > new Date())
      throw new BadRequestException("Birth date cannot be in the future.");
    await this.ownedMedia(userId, [
      input.photo,
      input.resume,
      ...(input.portfolio ?? []),
    ]);
    await this.profiles.findOneAndUpdate(
      { userId },
      { $set: input },
      { upsert: true, new: true, runValidators: true },
    );
    return this.profile(userId);
  }
  async apply(userId: string, input: ApplicationDto) {
    const opportunity = await this.content.findOne({
      _id: input.opportunityId,
      kind: { $in: ["projects", "casting"] },
      published: true,
      archived: false,
    });
    if (
      !opportunity ||
      ["Closed", "Completed", "Draft"].includes(opportunity.status) ||
      (opportunity.kind === "casting" && opportunity.status !== "Open") ||
      (opportunity.deadline && opportunity.deadline <= new Date())
    )
      throw new BadRequestException(
        "This opportunity is no longer accepting applications.",
      );
    await this.ownedMedia(userId, [input.document, ...(input.portfolio ?? [])]);
    try {
      const application = await this.applications.create({
        ...input,
        userId,
        opportunityTitle: opportunity.title,
        status: "Submitted",
      });
      const user = await this.accounts.findById(userId);
      if (user)
        await this.mail
          .send(
            user.email,
            "Application received",
            `Your application for ${opportunity.title} has been received.`,
          )
          .catch(() => undefined);
      return application;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      )
        throw new ConflictException(
          "You have already applied to this opportunity.",
        );
      throw error;
    }
  }
  async myApplications(userId: string) {
    return this.applications.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  async adminApplications(status?: string, projectId?: string) {
    return this.applications
      .find({
        ...(status ? { status } : {}),
        ...(projectId ? { opportunityId: this.id(projectId) } : {}),
      })
      .select("+adminNotes")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
  }
  async updateApplication(id: string, input: ApplicationUpdateDto) {
    const application = await this.applications
      .findByIdAndUpdate(
        this.id(id),
        { $set: input },
        { new: true, runValidators: true },
      )
      .select("+adminNotes");
    if (!application) throw new NotFoundException();
    const user = await this.accounts.findById(application.userId);
    if (user)
      await this.mail
        .send(
          user.email,
          "Application status updated",
          `Your application for ${application.opportunityTitle} is now ${application.status}.`,
        )
        .catch(() => undefined);
    return application;
  }
  async users(query: Record<string, string>) {
    const search =
      typeof query.search === "string"
        ? escapeSearch(query.search.slice(0, 100))
        : "";
    const accounts = await this.accounts
      .find({
        role: "USER",
        ...(query.verified === "true" ? { verified: true } : {}),
        ...(search ? { name: { $regex: search, $options: "i" } } : {}),
      })
      .sort({ _id: -1 })
      .limit(500)
      .lean();
    const profiles = await this.profiles
      .find({ userId: { $in: accounts.map((account) => String(account._id)) } })
      .lean();
    return accounts
      .map((account) => ({
        ...account,
        profile:
          profiles.find((profile) => profile.userId === String(account._id)) ??
          null,
      }))
      .filter(
        (account) =>
          ["city", "profession", "gender", "experience", "availability"].every(
            (key) =>
              !query[key] ||
              String(account.profile?.[key as keyof Profile] ?? "")
                .toLowerCase()
                .includes(String(query[key]).toLowerCase()),
          ) &&
          ["skills", "languages"].every(
            (key) =>
              !query[key] ||
              (account.profile?.[key as "skills" | "languages"] ?? []).some(
                (value) =>
                  value
                    .toLowerCase()
                    .includes(String(query[key]).toLowerCase()),
              ),
          ),
      );
  }
  async updateUser(id: string, input: UserUpdateDto, actorId: string) {
    if (id === actorId)
      throw new ForbiddenException("You cannot suspend your own account.");
    const account = await this.accounts.findOneAndUpdate(
      { _id: this.id(id), role: "USER" },
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!account) throw new NotFoundException();
    return account;
  }
  async saveList(userId: string, input: ListDto, id?: string) {
    const count = await this.accounts.countDocuments({
      _id: { $in: [...new Set(input.memberIds)] },
      role: "USER",
    });
    if (count !== new Set(input.memberIds).size)
      throw new BadRequestException("One or more members no longer exist.");
    if (
      input.projectId &&
      !(await this.content.exists({ _id: input.projectId, kind: "projects" }))
    )
      throw new BadRequestException("Project not found.");
    const record = id
      ? await this.lists.findOneAndUpdate(
          { _id: this.id(id), ownerId: userId },
          { $set: input },
          { new: true, runValidators: true },
        )
      : await this.lists.create({ ...input, ownerId: userId });
    if (!record) throw new NotFoundException();
    return record;
  }
  async deleteList(userId: string, id: string) {
    const result = await this.lists.deleteOne({
      _id: this.id(id),
      ownerId: userId,
    });
    if (!result.deletedCount) throw new NotFoundException();
    return { message: "List deleted." };
  }
  async contact(input: ContactDto) {
    await this.contacts.create(input);
    const recipient = this.config.get<string>("CONTACT_EMAIL");
    if (recipient)
      await this.mail
        .send(
          recipient,
          `Contact: ${input.subject}`,
          `${input.name} (${input.email})\n\n${input.message}`,
        )
        .catch(() => undefined);
    return { message: "Your message has been received." };
  }
  async metrics() {
    const [users, verified, projects, castings, applications, pending] =
      await Promise.all([
        this.accounts.countDocuments({ role: "USER" }),
        this.accounts.countDocuments({ role: "USER", verified: true }),
        this.content.countDocuments({ kind: "projects", archived: false }),
        this.content.countDocuments({
          kind: "casting",
          status: "Open",
          published: true,
          archived: false,
        }),
        this.applications.countDocuments(),
        this.applications.countDocuments({
          status: { $in: ["Submitted", "Under Review"] },
        }),
      ]);
    return { users, verified, projects, castings, applications, pending };
  }
}
