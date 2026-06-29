import "server-only";
import { LocalStorageDriver, type StorageDriver } from "@/shared/lib/storage-driver";
import { env } from "@/shared/config/env";

/** Singleton storage driver wired from env (local filesystem by default). */
export const storage: StorageDriver = new LocalStorageDriver(env.STORAGE_DIR);
