import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";

import { objectId } from "../../common/utils/object-id";
import type { Application } from "../applications/application.model";
import { Account } from "../auth/auth.models";
import { MediaService } from "../media/media.service";
import { MemberSettingsDto, ProfileDto } from "./profile.dto";
import { Profile } from "./profile.model";

type StatusCount = {
  _id: Application["status"];
  count: number;
};

function cleanList(values?: string[]) {
  if (!values) return values;
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function profileCompletion(profile: Partial<Profile>) {
  const values = [
    profile.bio,
    profile.city,
    profile.profession,
    profile.gender,
    profile.birthDate,
    profile.skills?.length,
    profile.languages?.length,
    profile.experience,
    profile.availability,
    profile.photoMediaId,
    profile.portfolioMediaIds?.length,
    profile.showreel,
  ];

  return Math.round((values.filter(Boolean).length / values.length) * 100);
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

  private serialize(profile: Profile | Record<string, unknown> | null) {
    if (!profile) return null;

    const item = profile as Profile;
    const photoId = item.photoMediaId ? String(item.photoMediaId) : undefined;
    const portfolioIds = (item.portfolioMediaIds ?? []).map(String);
    const resumeId = item.resumeMediaId ? String(item.resumeMediaId) : undefined;

    return {
      ...profile,
      _id: String((profile as { _id: unknown })._id),
      userId: String(item.userId),
      photoMediaId: photoId,
      photo: photoId ? this.media.urlsFor(photoId).profile : undefined,
      portfolioMediaIds: portfolioIds,
      portfolio: portfolioIds.map((id) => this.media.urlsFor(id).medium),
      resumeMediaId: resumeId,
      resume: resumeId ? this.media.urlsFor(resumeId, "document").document : undefined,
      completion: profileCompletion(item),
    };
  }

  async get(userId: string) {
    const [account, profile] = await Promise.all([
      this.accounts.findById(objectId(userId)).lean(),
      this.profiles
        .findOne({
          userId: objectId(userId),
        })
        .lean(),
    ]);

    if (!account) {
      throw new NotFoundException("Account not found.");
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
      completion: profileCompletion(profile ?? {}),
    };
  }

  async save(userId: string, input: ProfileDto) {
    const userObjectId = objectId(userId);
    const previous = await this.profiles.findOne({ userId: userObjectId }).lean();

    if (input.birthDate && new Date(input.birthDate) > new Date()) {
      throw new BadRequestException("Birth date cannot be in the future.");
    }

    if (input.portfolioMediaIds) {
      const unique = new Set(input.portfolioMediaIds);
      if (unique.size !== input.portfolioMediaIds.length) {
        throw new BadRequestException("The same photograph cannot be added to the portfolio more than once.");
      }
    }

    await this.media.assertOwnedBy(userId, [input.photoMediaId], "image", "user-profile");
    await this.media.assertOwnedBy(userId, [...(input.portfolioMediaIds ?? [])], "image", "user-portfolio");
    await this.media.assertOwnedBy(userId, [input.resumeMediaId], "document", "user-resume");

    const update: Record<string, unknown> = {
      ...input,
    };
    const unset: Record<string, 1> = {};

    if (input.publicVisible === true && previous?.publicVisible !== true) {
      update.publicVisibleConsentAt = new Date();
    }

    if (input.skills !== undefined) {
      update.skills = cleanList(input.skills);
    }

    if (input.languages !== undefined) {
      update.languages = cleanList(input.languages);
    }

    if (input.socialLinks !== undefined) {
      update.socialLinks = cleanList(input.socialLinks);
    }

    if (input.videos !== undefined) {
      update.videos = cleanList(input.videos);
    }

    if (input.birthDate !== undefined) {
      update.birthDate = new Date(input.birthDate);
    }

    if (input.photoMediaId === null) {
      delete update.photoMediaId;
      unset.photoMediaId = 1;
    } else if (input.photoMediaId !== undefined) {
      update.photoMediaId = new Types.ObjectId(input.photoMediaId);
    }

    if (input.resumeMediaId === null) {
      delete update.resumeMediaId;
      unset.resumeMediaId = 1;
    } else if (input.resumeMediaId !== undefined) {
      update.resumeMediaId = new Types.ObjectId(input.resumeMediaId);
    }

    if (input.showreel === null) {
      delete update.showreel;
      unset.showreel = 1;
    }

    if (input.portfolioMediaIds !== undefined) {
      update.portfolioMediaIds = input.portfolioMediaIds.map((id) => new Types.ObjectId(id));
    }

    const profile = await this.profiles.findOneAndUpdate(
      {
        userId: userObjectId,
      },
      {
        $set: update,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
        $setOnInsert: {
          userId: userObjectId,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    const publicMediaIds = [
      profile.photoMediaId ? String(profile.photoMediaId) : undefined,
      ...(profile.portfolioMediaIds ?? []).map(String),
    ];

    if (profile.publicVisible) {
      await this.media.makePublic(publicMediaIds);
    } else {
      await this.media.makePrivate(publicMediaIds);
    }

    const previousPublicIds = [previous?.photoMediaId, ...(previous?.portfolioMediaIds ?? [])].filter(Boolean).map(String);

    await this.media.makePrivate(previousPublicIds.filter((id) => !publicMediaIds.includes(id)));

    const previousOwnedIds = [previous?.photoMediaId, ...(previous?.portfolioMediaIds ?? []), previous?.resumeMediaId]
      .filter(Boolean)
      .map(String);

    const currentOwnedIds = new Set(
      [profile.photoMediaId, ...(profile.portfolioMediaIds ?? []), profile.resumeMediaId].filter(Boolean).map(String),
    );

    for (const id of previousOwnedIds) {
      if (!currentOwnedIds.has(id)) {
        await this.media.removeIfUnreferencedOwned(id, userId).catch(() => undefined);
      }
    }

    return this.get(userId);
  }

  async updateSettings(userId: string, input: MemberSettingsDto) {
    if (input.savedOpportunityIds) {
      const ids = [...new Set(input.savedOpportunityIds)].map((id) => objectId(id));
      const filter = { _id: { $in: ids }, published: true, archived: false };
      const counts = await Promise.all([
        this.profiles.db.collection("projects").countDocuments(filter),
        this.profiles.db.collection("castings").countDocuments(filter),
      ]);
      if (counts[0] + counts[1] !== ids.length) throw new BadRequestException("One or more saved opportunities are no longer available.");
    }
    const profile = await this.profiles.findOneAndUpdate(
      {
        userId: objectId(userId),
      },
      {
        $set: {
          ...input,
          ...(input.publicVisible === true ? { publicVisibleConsentAt: new Date() } : {}),
        },
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

    if (input.publicVisible !== undefined) {
      const ids = [profile.photoMediaId ? String(profile.photoMediaId) : undefined, ...(profile.portfolioMediaIds ?? []).map(String)];

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

    const [account, profile, statusCounts, recent] = await Promise.all([
      this.accounts.findById(id).lean(),
      this.profiles.findOne({ userId: id }).lean(),
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
        .select("_id opportunityType opportunityId opportunityTitle roleSnapshot status createdAt")
        .lean(),
    ]);

    if (!account) {
      throw new NotFoundException("Account not found.");
    }

    const counts: Record<string, number> = Object.fromEntries(statusCounts.map((item) => [item._id, Number(item.count)]));

    const total = Object.values(counts).reduce((sum: number, value: number) => sum + value, 0);

    return {
      member: {
        id: String(account._id),
        name: account.name,
        verified: account.verified,
      },
      profileCompletion: profileCompletion(profile ?? {}),
      profile: this.serialize(profile),
      applicationSummary: {
        total,
        submitted: Number(counts["Submitted"] ?? 0),
        underReview: Number(counts["Under Review"] ?? 0),
        shortlisted: Number(counts["Shortlisted"] ?? 0),
        selected: Number(counts["Selected"] ?? 0),
        rejected: Number(counts["Rejected"] ?? 0),
      },
      recentApplications: recent.map((item) => ({
        ...item,
        _id: String(item._id),
        opportunityId: String(item.opportunityId),
      })),
    };
  }
}
