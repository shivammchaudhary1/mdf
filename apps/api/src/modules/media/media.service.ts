import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import sharp, { type Metadata } from "sharp";

import { sha256 } from "../../common/utils/crypto";
import { objectId } from "../../common/utils/object-id";
import { AuthService } from "../auth/auth.service";
import { Media } from "./media.model";
import { StorageAdapter } from "./storage";

export type Upload = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const IMAGE_VARIANTS = {
  thumb: { width: 400, quality: 78 },
  profile: { width: 800, height: 800, quality: 82 },
  medium: { width: 1200, quality: 82 },
  large: { width: 1920, quality: 84 },
} as const;

export type MediaVariant = keyof typeof IMAGE_VARIANTS | "document";

@Injectable()
export class MediaService {
  constructor(
    @InjectModel("Media")
    private readonly media: Model<Media>,
    private readonly storage: StorageAdapter,
    private readonly auth: AuthService,
  ) {}

  private storageKey(id: Types.ObjectId | string, variant: MediaVariant) {
    const extension = variant === "document" ? "pdf" : "webp";
    return `media/${String(id)}/${variant}.${extension}`;
  }

  private variantsFor(kind: "image" | "document"): MediaVariant[] {
    return kind === "document" ? ["document"] : ["thumb", "profile", "medium", "large"];
  }

  private async deleteStored(id: Types.ObjectId | string, kind: "image" | "document") {
    const variants = this.variantsFor(kind);
    const results = await Promise.allSettled(variants.map((variant) => this.storage.delete(this.storageKey(id, variant))));

    if (results.some((result) => result.status === "rejected")) {
      throw new ServiceUnavailableException("Media storage is temporarily unavailable. Please try again.");
    }
  }

  private async referenced(id: Types.ObjectId) {
    const [profiles, applications, projects, castings, contents] = await Promise.all([
      this.media.db.collection("profiles").countDocuments({
        $or: [{ photoMediaId: id }, { portfolioMediaIds: id }, { resumeMediaId: id }],
      }),
      this.media.db.collection("applications").countDocuments({
        $or: [{ portfolioMediaIds: id }, { documentMediaId: id }],
      }),
      this.media.db.collection("projects").countDocuments({
        $or: [{ coverMediaId: id }, { galleryMediaIds: id }],
      }),
      this.media.db.collection("castings").countDocuments({
        coverMediaId: id,
      }),
      this.media.db.collection("contents").countDocuments({
        $or: [{ coverMediaId: id }, { mediaIds: id }],
      }),
    ]);

    return profiles + applications + projects + castings + contents > 0;
  }

  urlsFor(id: string, kind: "image" | "document" = "image") {
    if (kind === "document") {
      return {
        document: `/api/v1/media/${id}/document`,
      };
    }

    return Object.fromEntries(Object.keys(IMAGE_VARIANTS).map((variant) => [variant, `/api/v1/media/${id}/${variant}`]));
  }

  async upload(ownerId: string, file?: Upload) {
    if (!file) {
      throw new BadRequestException("Select a file.");
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("Select a file up to 10 MB.");
    }

    const owner = objectId(ownerId, "Account not found.");
    const contentHash = sha256(file.buffer);

    const duplicate = await this.media
      .findOne({
        ownerId: owner,
        contentHash,
      })
      .lean();

    if (duplicate) {
      return {
        id: String(duplicate._id),
        kind: duplicate.kind,
        visibility: duplicate.visibility,
        urls: this.urlsFor(String(duplicate._id), duplicate.kind),
        duplicate: true,
      };
    }

    const id = new Types.ObjectId();

    if (file.mimetype === "application/pdf" && file.buffer.subarray(0, 5).toString() === "%PDF-") {
      try {
        await this.storage.write(this.storageKey(id, "document"), file.buffer, "application/pdf");
      } catch {
        throw new ServiceUnavailableException("Media storage is temporarily unavailable. Please try again.");
      }

      try {
        const record = await this.media.create({
          _id: id,
          ownerId: owner,
          kind: "document",
          visibility: "private",
          originalName: file.originalname.slice(0, 150),
          sourceMime: "application/pdf",
          sourceBytes: file.size,
          contentHash,
        });

        return {
          id: String(record._id),
          kind: record.kind,
          visibility: record.visibility,
          urls: this.urlsFor(String(record._id), "document"),
          duplicate: false,
        };
      } catch (error) {
        await this.deleteStored(id, "document").catch(() => undefined);
        throw error;
      }
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      throw new BadRequestException("Use JPEG, PNG, WebP or PDF files.");
    }

    let metadata: Metadata;
    const processed = new Map<keyof typeof IMAGE_VARIANTS, Buffer>();

    try {
      const input = sharp(file.buffer, {
        limitInputPixels: 40_000_000,
        sequentialRead: true,
      }).rotate();

      metadata = await input.metadata();

      if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
        throw new Error("Unsupported image format.");
      }

      for (const [variant, settings] of Object.entries(IMAGE_VARIANTS)) {
        const size = settings as {
          width: number;
          height?: number;
          quality: number;
        };

        processed.set(
          variant as keyof typeof IMAGE_VARIANTS,
          await input
            .clone()
            .resize(size.width, size.height, {
              fit: size.height ? "cover" : "inside",
              withoutEnlargement: true,
              position: "attention",
            })
            .webp({
              quality: size.quality,
              smartSubsample: true,
            })
            .toBuffer(),
        );
      }
    } catch {
      throw new BadRequestException("The image could not be processed. Use a valid image under 40 megapixels.");
    }

    try {
      for (const [variant, buffer] of processed.entries()) {
        await this.storage.write(this.storageKey(id, variant), buffer, "image/webp");
      }
    } catch {
      await this.deleteStored(id, "image").catch(() => undefined);
      throw new ServiceUnavailableException("Media storage is temporarily unavailable. Please try again.");
    }

    try {
      const record = await this.media.create({
        _id: id,
        ownerId: owner,
        kind: "image",
        visibility: "private",
        originalName: file.originalname.slice(0, 150),
        sourceMime: file.mimetype,
        sourceBytes: file.size,
        width: metadata.width,
        height: metadata.height,
        contentHash,
      });

      return {
        id: String(record._id),
        kind: record.kind,
        visibility: record.visibility,
        urls: this.urlsFor(String(record._id), "image"),
        duplicate: false,
      };
    } catch (error) {
      await this.deleteStored(id, "image").catch(() => undefined);
      throw error;
    }
  }

  async assertOwnedBy(userId: string, values: (string | null | undefined)[], kind?: "image" | "document") {
    const supplied = values.filter((value): value is string => typeof value === "string" && value.length > 0);

    if (supplied.some((value) => !Types.ObjectId.isValid(value))) {
      throw new BadRequestException("One or more media IDs are invalid.");
    }

    const ids = [...new Set(supplied)];
    if (!ids.length) return;

    const count = await this.media.countDocuments({
      _id: {
        $in: ids.map((id) => new Types.ObjectId(id)),
      },
      ownerId: new Types.ObjectId(userId),
      ...(kind ? { kind } : {}),
    });

    if (count !== ids.length) {
      throw new BadRequestException("Use media uploaded to the current account.");
    }
  }

  async makePublic(ids: (string | null | undefined)[]) {
    const valid = [
      ...new Set(
        ids.filter((value): value is string => typeof value === "string" && value.length > 0).filter((id) => Types.ObjectId.isValid(id)),
      ),
    ];

    if (!valid.length) return;

    await this.media.updateMany(
      {
        kind: "image",
        _id: {
          $in: valid.map((id) => new Types.ObjectId(id)),
        },
      },
      {
        $set: {
          visibility: "public",
        },
      },
    );
  }

  async makePrivate(ids: (string | null | undefined)[]) {
    const valid = [
      ...new Set(
        ids.filter((value): value is string => typeof value === "string" && value.length > 0).filter((id) => Types.ObjectId.isValid(id)),
      ),
    ];

    if (!valid.length) return;

    const objectIds = valid.map((id) => new Types.ObjectId(id));
    const references = await Promise.all([
      this.media.db
        .collection("projects")
        .find({ published: true, archived: false, $or: [{ coverMediaId: { $in: objectIds } }, { galleryMediaIds: { $in: objectIds } }] })
        .project({ coverMediaId: 1, galleryMediaIds: 1 })
        .toArray(),
      this.media.db
        .collection("castings")
        .find({ published: true, archived: false, coverMediaId: { $in: objectIds } })
        .project({ coverMediaId: 1 })
        .toArray(),
      this.media.db
        .collection("contents")
        .find({ published: true, archived: false, $or: [{ coverMediaId: { $in: objectIds } }, { mediaIds: { $in: objectIds } }] })
        .project({ coverMediaId: 1, mediaIds: 1 })
        .toArray(),
      this.media.db
        .collection("profiles")
        .find({ publicVisible: true, $or: [{ photoMediaId: { $in: objectIds } }, { portfolioMediaIds: { $in: objectIds } }] })
        .project({ photoMediaId: 1, portfolioMediaIds: 1 })
        .toArray(),
    ]);
    const published = new Set(
      references
        .flat()
        .flatMap((record) => [
          record.coverMediaId,
          record.photoMediaId,
          ...(record.galleryMediaIds ?? []),
          ...(record.mediaIds ?? []),
          ...(record.portfolioMediaIds ?? []),
        ])
        .filter(Boolean)
        .map(String),
    );
    await this.media.updateMany(
      {
        _id: {
          $in: valid.filter((id) => !published.has(id)).map((id) => new Types.ObjectId(id)),
        },
      },
      {
        $set: {
          visibility: "private",
        },
      },
    );
  }

  async read(id: string, variant: string, token?: string) {
    const mediaId = objectId(id);

    if (!["thumb", "profile", "medium", "large", "document"].includes(variant)) {
      throw new NotFoundException();
    }

    const record = await this.media.findById(mediaId).lean();

    if (!record) {
      throw new NotFoundException();
    }

    if ((record.kind === "document") !== (variant === "document")) {
      throw new NotFoundException();
    }

    if (record.kind === "document" || record.visibility !== "public") {
      const user = await this.auth.authenticate(token);

      if (String(record.ownerId) !== user.id && user.role !== "SUPER_ADMIN") {
        throw new NotFoundException();
      }
    }

    try {
      return {
        buffer: await this.storage.read(this.storageKey(mediaId, variant as MediaVariant)),
        type: record.kind === "document" ? "application/pdf" : "image/webp",
        private: record.kind === "document" || record.visibility !== "public",
        originalName: record.originalName,
      };
    } catch {
      throw new NotFoundException();
    }
  }

  async removeIfUnreferencedOwned(id: string, ownerId: string) {
    if (!Types.ObjectId.isValid(id)) return false;

    const record = await this.media.findOne({
      _id: new Types.ObjectId(id),
      ownerId: new Types.ObjectId(ownerId),
    });

    if (!record || (await this.referenced(record._id))) {
      return false;
    }

    await this.deleteStored(record._id, record.kind);
    await record.deleteOne();
    return true;
  }

  async remove(
    id: string,
    actor: {
      id: string;
      role: "USER" | "SUPER_ADMIN";
    },
  ) {
    const record = await this.media.findById(objectId(id));

    if (!record) {
      throw new NotFoundException();
    }

    if (actor.role !== "SUPER_ADMIN" && String(record.ownerId) !== actor.id) {
      throw new ForbiddenException("You cannot delete this media.");
    }

    if (await this.referenced(record._id)) {
      throw new ConflictException("Remove this file from your profile, portfolio or application before deleting it.");
    }

    if (record.visibility === "public" && actor.role !== "SUPER_ADMIN") {
      await this.makePrivate([String(record._id)]);
      const refreshed = await this.media.findById(record._id).lean();
      if (refreshed?.visibility === "public") {
        throw new ForbiddenException("Published media can only be removed after it is no longer used publicly.");
      }
    }

    await this.deleteStored(record._id, record.kind);
    await record.deleteOne();

    return {
      message: "Media deleted.",
    };
  }
}
