import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

const LEGACY_IMAGE = /^media\/[a-f0-9]{24}\/(thumb|profile|medium|large)\.webp$/;
const LEGACY_DOCUMENT = /^media\/[a-f0-9]{24}\/document\.pdf$/;
const ASSET_IMAGE =
  /^assets\/(website-images|projects|castings|blog|gallery|team|bts|shows)\/[a-f0-9]{24}\/(thumb|profile|medium|large)\.webp$/;
const MEMBER_IMAGE = /^members\/[a-f0-9]{24}\/(profile-pic|portfolio-images)\/[a-f0-9]{24}\/(thumb|profile|medium|large)\.webp$/;
const MEMBER_DOCUMENT = /^members\/[a-f0-9]{24}\/resume\/[a-f0-9]{24}\/document\.pdf$/;

export abstract class StorageAdapter {
  abstract write(key: string, data: Buffer, contentType?: string): Promise<void>;
  abstract read(key: string): Promise<Buffer>;
  abstract delete(key: string): Promise<void>;
}

export function validateStorageKey(key: string) {
  if (![LEGACY_IMAGE, LEGACY_DOCUMENT, ASSET_IMAGE, MEMBER_IMAGE, MEMBER_DOCUMENT].some((pattern) => pattern.test(key))) {
    throw new Error("Invalid storage key.");
  }

  return key;
}

export class LocalStorageAdapter extends StorageAdapter {
  private readonly root = resolve(process.cwd(), ".local", "uploads");

  private filePath(key: string) {
    const file = resolve(this.root, validateStorageKey(key));
    const separator = process.platform === "win32" ? "\\" : "/";

    if (!file.startsWith(`${this.root}${separator}`)) {
      throw new Error("Invalid storage path.");
    }

    return file;
  }

  async write(key: string, data: Buffer) {
    const file = this.filePath(key);
    await mkdir(dirname(file), { recursive: true, mode: 0o700 });
    await writeFile(file, data, { mode: 0o600 });
  }

  async read(key: string) {
    return readFile(this.filePath(key));
  }

  async delete(key: string) {
    await rm(this.filePath(key), { force: true });
  }
}

export class S3StorageAdapter extends StorageAdapter {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    super();

    const region = config.get<string>("AWS_REGION");
    const bucket = config.get<string>("S3_BUCKET");

    if (!region || !bucket) {
      throw new Error("AWS_REGION and S3_BUCKET are required when STORAGE_DRIVER=s3.");
    }

    this.bucket = bucket;

    const accessKeyId = config.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = config.get<string>("AWS_SECRET_ACCESS_KEY");

    this.client = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
  }

  async write(key: string, data: Buffer, contentType?: string) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: validateStorageKey(key),
        Body: data,
        ContentType: contentType,
        CacheControl: "private, max-age=31536000, immutable",
        ServerSideEncryption: "AES256",
      }),
    );
  }

  async read(key: string) {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: validateStorageKey(key),
      }),
    );

    if (!response.Body) throw new Error("Stored object is empty.");
    return Buffer.from(await response.Body.transformToByteArray());
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: validateStorageKey(key),
      }),
    );
  }
}
