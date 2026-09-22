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

function isYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
  } catch {
    return false;
  }
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
      memberId: String(item.memberId),
      photoMediaId: photoId,
      photo: photoId ? this.media.urlsFor(photoId).profile : undefined,
      portfolioMediaIds: portfolioIds,
      portfolio: portfolioIds.map((id) => this.media.urlsFor(id).medium),
      resumeMediaId: resumeId,
      resume: resumeId ? this.media.urlsFor(resumeId, "document").document : undefined,
      completion: profileCompletion(item),
    };
  }

  async get(memberId: string) {
    const [account, profile] = await Promise.all([
      this.accounts.findById(objectId(memberId)).lean(),
      this.profiles
        .findOne({
          memberId: objectId(memberId),
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

  async save(memberId: string, input: ProfileDto) {
    const memberObjectId = objectId(memberId);
    const previous = await this.profiles.findOne({ memberId: memberObjectId }).lean();

    if (input.birthDate && new Date(input.birthDate) > new Date()) {
      throw new BadRequestException("Birth date cannot be in the future.");
    }

    if (input.showreel && !isYoutubeUrl(input.showreel)) {
      throw new BadRequestException("Intro / pitch video must be a valid YouTube URL.");
    }

    if (input.portfolioMediaIds) {
      const unique = new Set(input.portfolioMediaIds);
      if (unique.size !== input.portfolioMediaIds.length) {
        throw new BadRequestException("The same photograph cannot be added to the portfolio more than once.");
      }
    }

    await this.media.assertOwnedBy(memberId, [input.photoMediaId], "image", "member-profile");
    await this.media.assertOwnedBy(memberId, [...(input.portfolioMediaIds ?? [])], "image", "member-portfolio");
    await this.media.assertOwnedBy(memberId, [input.resumeMediaId], "document", "member-resume");

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
        memberId: memberObjectId,
      },
      {
        $set: update,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
        $setOnInsert: {
          memberId: memberObjectId,
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
        await this.media.removeIfUnreferencedOwned(id, memberId).catch(() => undefined);
      }
    }

    return this.get(memberId);
  }

  async replacePortfolioPhoto(memberId: string, index: number, mediaId: string) {
    if (!Number.isInteger(index) || index < 0 || index > 7) {
      throw new BadRequestException("Portfolio photograph position is invalid.");
    }

    await this.media.assertOwnedBy(memberId, [mediaId], "image", "member-portfolio");

    const profile = await this.profiles.findOne({ memberId: objectId(memberId) });
    if (!profile) throw new NotFoundException("Profile not found.");

    const current = [...(profile.portfolioMediaIds ?? [])];
    if (index >= current.length) {
      throw new BadRequestException("Portfolio photograph position is invalid.");
    }

    if (current.some((id, itemIndex) => itemIndex !== index && String(id) === mediaId)) {
      throw new BadRequestException("The same photograph cannot be added to the portfolio more than once.");
    }

    const previousMediaId = String(current[index]);
    current[index] = new Types.ObjectId(mediaId);
    profile.portfolioMediaIds = current;
    await profile.save();

    if (profile.publicVisible) {
      await this.media.makePublic([mediaId]);
    } else {
      await this.media.makePrivate([mediaId]);
    }

    // Replace only the active profile reference. The old media record/object is
    // deliberately retained in storage for archival/recovery purposes.
    await this.media.makePrivate([previousMediaId]);

    return this.get(memberId);
  }

  async updateSettings(memberId: string, input: MemberSettingsDto) {
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
        memberId: objectId(memberId),
      },
      {
        $set: {
          ...input,
          ...(input.publicVisible === true ? { publicVisibleConsentAt: new Date() } : {}),
        },
        $setOnInsert: {
          memberId: objectId(memberId),
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

    return this.get(memberId);
  }

  async dashboard(memberId: string) {
    const id = objectId(memberId);

    const [account, profile, statusCounts, recent] = await Promise.all([
      this.accounts.findById(id).lean(),
      this.profiles.findOne({ memberId: id }).lean(),
      this.applications.aggregate<StatusCount>([
        {
          $match: {
            memberId: id,
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
        .find({ memberId: id })
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
