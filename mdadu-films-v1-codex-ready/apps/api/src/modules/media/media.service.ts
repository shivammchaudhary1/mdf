import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { isValidObjectId } from "mongoose";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { Media, ContentRecord } from "../platform/platform.models";
import { AuthService } from "../auth/auth.service";
import { StorageAdapter } from "./storage";
export type Upload = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};
@Injectable()
export class MediaService {
  constructor(
    @InjectModel("Media") private readonly media: Model<Media>,
    @InjectModel("Content") private readonly content: Model<ContentRecord>,
    private readonly storage: StorageAdapter,
    private readonly auth: AuthService,
  ) {}
  async upload(ownerId: string, file?: Upload) {
    if (!file || file.size > 10 * 1024 * 1024)
      throw new BadRequestException("Select a file up to 10 MB.");
    const files: Record<string, string> = {};
    let kind: "image" | "document" = "image";
    if (
      file.mimetype === "application/pdf" &&
      file.buffer.subarray(0, 5).toString() === "%PDF-"
    ) {
      kind = "document";
      files.document = `${randomUUID()}.pdf`;
      await this.storage.write(files.document, file.buffer);
    } else {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
        throw new BadRequestException("Use JPEG, PNG, WebP or PDF files.");
      try {
        const input = sharp(file.buffer, {
          limitInputPixels: 40000000,
        }).rotate();
        const metadata = await input.metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
          throw new Error();
        for (const [variant, size] of Object.entries({
          thumb: 400,
          profile: 800,
          medium: 1200,
          large: 1920,
        })) {
          const buffer = await input
            .clone()
            .resize(size, variant === "profile" ? size : undefined, {
              fit: variant === "profile" ? "cover" : "inside",
              withoutEnlargement: true,
            })
            .webp({ quality: 85 })
            .toBuffer();
          files[variant] = `${randomUUID()}.webp`;
          await this.storage.write(files[variant], buffer);
        }
      } catch {
        throw new BadRequestException(
          "The image could not be processed. Use a valid image under 40 megapixels.",
        );
      }
    }
    const record = await this.media.create({
      ownerId,
      kind,
      files,
      originalName: file.originalname.slice(0, 150),
    });
    return {
      id: String(record._id),
      kind,
      urls: Object.fromEntries(
        Object.keys(files).map((variant) => [
          variant,
          `/api/v1/media/${record._id}/${variant}`,
        ]),
      ),
    };
  }
  async read(id: string, variant: string, token?: string) {
    if (
      !isValidObjectId(id) ||
      !["thumb", "profile", "medium", "large", "document"].includes(variant)
    )
      throw new NotFoundException();
    const record = await this.media.findById(id).lean();
    if (!record) throw new NotFoundException();
    const publicImage =
      record.kind === "image" &&
      (await this.content.exists({
        published: true,
        archived: false,
        $or: [
          { image: { $regex: `^/api/v1/media/${id}/` } },
          { images: { $regex: `^/api/v1/media/${id}/` } },
        ],
      }));
    if (!publicImage) {
      const user = await this.auth.authenticate(token);
      if (user.id !== record.ownerId && user.role !== "SUPER_ADMIN")
        throw new NotFoundException();
    }
    const key = record.files[variant];
    if (!key) throw new NotFoundException();
    try {
      return {
        buffer: await this.storage.read(key),
        type: record.kind === "document" ? "application/pdf" : "image/webp",
        private: !publicImage,
      };
    } catch {
      throw new NotFoundException();
    }
  }
}
