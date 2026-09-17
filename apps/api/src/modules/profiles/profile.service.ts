import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, type Model } from "mongoose";
import { objectId } from "../../common/utils/object-id";
import { Account } from "../auth/auth.models";
import type { Application } from "../applications/application.model";
import { MediaService } from "../media/media.service";
import { Profile } from "./profile.model";
import {
  MemberSettingsDto,
  ProfileDto,
} from "./profile.dto";

type StatusCount = {
  _id: Application["status"];
  count: number;
};

export function profileCompletion(
  profile: Partial<Profile>,
) {
  const values = [
    profile.bio,
    profile.city,
    profile.profession,
    profile.skills?.length,
    profile.languages?.length,
    profile.experience,
    profile.availability,
    profile.photoMediaId,
    profile.portfolioMediaIds?.length,
    profile.showreel,
  ];

  return Math.round(
    (values.filter(Boolean).length /
      values.length) *
      100,
  );
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel("Profile")
    private readonly profiles: Model<Profile>,
    @InjectModel("Account")
    private readonly accounts: Model<Account>,
    @InjectModel("Application")
    private readonly applications: Model<Application>,
    private readonly media: MediaService,
  ) {}

  private serialize(
    profile:
      | Profile
      | Record<string, unknown>
      | null,
  ) {
    if (!profile) return null;

    const item = profile as Profile;
    const photoId = item.photoMediaId
      ? String(item.photoMediaId)
      : undefined;
    const portfolioIds = (
      item.portfolioMediaIds ?? []
    ).map(String);
    const resumeId = item.resumeMediaId
      ? String(item.resumeMediaId)
      : undefined;

    return {
      ...profile,
      _id: String(
        (profile as { _id: unknown })._id,
      ),
      userId: String(item.userId),
      photoMediaId: photoId,
      photo: photoId
        ? this.media.urlsFor(photoId).profile
        : undefined,
      portfolioMediaIds: portfolioIds,
      portfolio: portfolioIds.map(
        (id) =>
          this.media.urlsFor(id).medium,
      ),
      resumeMediaId: resumeId,
      resume: resumeId
        ? this.media.urlsFor(
            resumeId,
            "document",
          ).document
        : undefined,
      completion: profileCompletion(item),
    };
  }

  async get(userId: string) {
    const [account, profile] =
      await Promise.all([
        this.accounts
          .findById(objectId(userId))
          .lean(),
        this.profiles
          .findOne({
            userId: objectId(userId),
          })
          .lean(),
      ]);

    if (!account) {
      throw new NotFoundException(
        "Account not found.",
      );
    }

    return {
      account: {
        id: String(account._id),
        name: account.name,
        email: account.email,
        mobile: account.mobile,
        verified: account.verified,
      },
      profile: this.serialize(profile),
      completion: profileCompletion(
        profile ?? {},
      ),
    };
  }

  async save(
    userId: string,
    input: ProfileDto,
  ) {
    if (
      input.birthDate &&
      new Date(input.birthDate) > new Date()
    ) {
      throw new BadRequestException(
        "Birth date cannot be in the future.",
      );
    }

    await this.media.assertOwnedBy(userId, [
      input.photoMediaId,
      input.resumeMediaId,
      ...(input.portfolioMediaIds ?? []),
    ]);

    const update: Record<string, unknown> = {
      ...input,
    };

    if (input.birthDate !== undefined) {
      update.birthDate = new Date(
        input.birthDate,
      );
    }

    if (input.photoMediaId) {
      update.photoMediaId =
        new Types.ObjectId(
          input.photoMediaId,
        );
    }

    if (input.resumeMediaId) {
      update.resumeMediaId =
        new Types.ObjectId(
          input.resumeMediaId,
        );
    }

    if (input.portfolioMediaIds) {
      update.portfolioMediaIds =
        input.portfolioMediaIds.map(
          (id) => new Types.ObjectId(id),
        );
    }

    const profile =
      await this.profiles.findOneAndUpdate(
        {
          userId: objectId(userId),
        },
        {
          $set: update,
          $setOnInsert: {
            userId: objectId(userId),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

    const mediaIds = [
      profile.photoMediaId
        ? String(profile.photoMediaId)
        : undefined,
      ...(profile.portfolioMediaIds ?? []).map(
        String,
      ),
    ];

    if (profile.publicVisible) {
      await this.media.makePublic(mediaIds);
    } else {
      await this.media.makePrivate(mediaIds);
    }

    return this.get(userId);
  }

  async updateSettings(
    userId: string,
    input: MemberSettingsDto,
  ) {
    const profile =
      await this.profiles.findOneAndUpdate(
        {
          userId: objectId(userId),
        },
        {
          $set: input,
          $setOnInsert: {
            userId: objectId(userId),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );

    if (
      input.publicVisible !== undefined
    ) {
      const ids = [
        profile.photoMediaId
          ? String(profile.photoMediaId)
          : undefined,
        ...(profile.portfolioMediaIds ?? []).map(
          String,
        ),
      ];

      if (input.publicVisible) {
        await this.media.makePublic(ids);
      } else {
        await this.media.makePrivate(ids);
      }
    }

    return this.get(userId);
  }

  async dashboard(userId: string) {
    const id = objectId(userId);

    const [
      account,
      profile,
      statusCounts,
      recent,
    ] = await Promise.all([
      this.accounts.findById(id).lean(),
      this.profiles
        .findOne({ userId: id })
        .lean(),
      this.applications.aggregate<StatusCount>([
        {
          $match: {
            userId: id,
          },
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
      this.applications
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "_id opportunityType opportunityId opportunityTitle roleSnapshot status createdAt",
        )
        .lean(),
    ]);

    if (!account) {
      throw new NotFoundException(
        "Account not found.",
      );
    }

    const counts: Record<string, number> =
      Object.fromEntries(
        statusCounts.map((item) => [
          item._id,
          Number(item.count),
        ]),
      );

    const total = Object.values(
      counts,
    ).reduce(
      (sum: number, value: number) =>
        sum + value,
      0,
    );

    return {
      member: {
        id: String(account._id),
        name: account.name,
        verified: account.verified,
      },
      profileCompletion:
        profileCompletion(profile ?? {}),
      profile: this.serialize(profile),
      applicationSummary: {
        total,
        submitted: Number(
          counts["Submitted"] ?? 0,
        ),
        underReview: Number(
          counts["Under Review"] ?? 0,
        ),
        shortlisted: Number(
          counts["Shortlisted"] ?? 0,
        ),
        selected: Number(
          counts["Selected"] ?? 0,
        ),
        rejected: Number(
          counts["Rejected"] ?? 0,
        ),
      },
      recentApplications: recent.map(
        (item) => ({
          ...item,
          _id: String(item._id),
          opportunityId: String(
            item.opportunityId,
          ),
        }),
      ),
    };
  }
}
