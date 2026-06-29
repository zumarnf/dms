import type { StorageDriver } from "@/shared/lib/storage-driver";

/** In-memory StorageDriver for tests (no filesystem). */
export class MemoryStorageDriver implements StorageDriver {
  readonly store = new Map<string, Uint8Array>();

  async put(key: string, data: Uint8Array): Promise<void> {
    this.store.set(key, data);
  }
  async get(key: string): Promise<Buffer> {
    const value = this.store.get(key);
    if (!value) throw new Error(`Missing key: ${key}`);
    return Buffer.from(value);
  }
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  async exists(key: string): Promise<boolean> {
    return this.store.has(key);
  }
}
