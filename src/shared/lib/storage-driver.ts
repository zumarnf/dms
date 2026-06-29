import { mkdir, readFile, writeFile, unlink, access } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

/**
 * Storage abstraction. The app uses a local filesystem driver by default;
 * the same interface can be backed by S3/R2 later without touching callers.
 */
export interface StorageDriver {
  put(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/** Filesystem driver. Keys are confined to `baseDir` (path-traversal safe). */
export class LocalStorageDriver implements StorageDriver {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = resolve(baseDir);
  }

  private resolveKey(key: string): string {
    const target = resolve(join(this.baseDir, key));
    // Reject anything that escapes the base directory.
    if (target !== this.baseDir && !target.startsWith(this.baseDir + sep)) {
      throw new Error("Invalid storage key");
    }
    return target;
  }

  async put(key: string, data: Uint8Array): Promise<void> {
    const path = this.resolveKey(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }

  async get(key: string): Promise<Buffer> {
    return readFile(this.resolveKey(key));
  }

  async delete(key: string): Promise<void> {
    await unlink(this.resolveKey(key)).catch(() => undefined);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await access(this.resolveKey(key));
      return true;
    } catch {
      return false;
    }
  }
}
