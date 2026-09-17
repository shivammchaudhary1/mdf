import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
export abstract class StorageAdapter { abstract write(key: string, data: Buffer, contentType?: string): Promise<void>; abstract read(key: string): Promise<Buffer>; abstract delete(key: string): Promise<void>; }
function validateKey(key: string) {
  if (!/^media\/[a-f0-9]{24}\/(thumb|profile|medium|large)\.webp$/.test(key) && !/^media\/[a-f0-9]{24}\/document\.pdf$/.test(key)) throw new Error("Invalid storage key.");
  return key;
}
export class LocalStorageAdapter extends StorageAdapter {
  private readonly root = resolve(process.cwd(), ".local", "uploads");
  private filePath(key: string) {
    const file = resolve(this.root, validateKey(key));
    const sep = process.platform === "win32" ? "\\" : "/";
    if (!file.startsWith(`${this.root}${sep}`)) throw new Error("Invalid storage path.");
    return file;
  }
  async write(key: string, data: Buffer) { const file = this.filePath(key); await mkdir(dirname(file), { recursive: true, mode: 0o700 }); await writeFile(file, data, { mode: 0o600 }); }
  async read(key: string) { return readFile(this.filePath(key)); }
  async delete(key: string) { await rm(this.filePath(key), { force: true }); }
}
export class S3StorageAdapter extends StorageAdapter {
  private readonly client: S3Client; private readonly bucket: string;
  constructor(config: ConfigService) {
    const region = config.get<string>("AWS_REGION"); const bucket = config.get<string>("S3_BUCKET");
    if (!region || !bucket) throw new Error("AWS_REGION and S3_BUCKET are required when STORAGE_DRIVER=s3.");
    this.bucket = bucket;
    this.client = new S3Client({ region, ...(config.get<string>("AWS_ACCESS_KEY_ID") && config.get<string>("AWS_SECRET_ACCESS_KEY") ? { credentials: { accessKeyId: String(config.get("AWS_ACCESS_KEY_ID")), secretAccessKey: String(config.get("AWS_SECRET_ACCESS_KEY")) } } : {}) });
  }
  async write(key: string, data: Buffer, contentType?: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: validateKey(key), Body: data, ContentType: contentType, CacheControl: contentType === "application/pdf" ? "private, no-store" : "public, max-age=31536000, immutable", ServerSideEncryption: "AES256" }));
  }
  async read(key: string) { const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: validateKey(key) })); if (!response.Body) throw new Error("Stored object is empty."); return Buffer.from(await response.Body.transformToByteArray()); }
  async delete(key: string) { await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: validateKey(key) })); }
}
