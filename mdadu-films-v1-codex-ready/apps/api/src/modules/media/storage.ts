import { Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
export abstract class StorageAdapter {
  abstract write(key: string, data: Buffer): Promise<void>;
  abstract read(key: string): Promise<Buffer>;
}
@Injectable()
export class LocalStorageAdapter extends StorageAdapter {
  private readonly root = join(process.cwd(), ".local", "uploads");
  async write(key: string, data: Buffer) {
    await mkdir(this.root, { recursive: true, mode: 0o700 });
    await writeFile(join(this.root, key), data, { mode: 0o600 });
  }
  async read(key: string) {
    if (!/^[a-f0-9-]+\.(webp|pdf)$/.test(key))
      throw new Error("Invalid storage key");
    return readFile(join(this.root, key));
  }
}
