// Single Drizzle entry point. Entity tables live under src/entities/<name>/schema.ts
// and are aggregated here so drizzle-kit and the db client share one schema.
// Relative imports are used so drizzle-kit (which does not resolve tsconfig path
// aliases) can bundle this graph.
export * from "../../entities/user/schema";
export * from "../../entities/folder/schema";
export * from "../../entities/document/schema";
export * from "../../entities/version/schema";
export * from "../../entities/tag/schema";
export * from "../../entities/permission/schema";
export * from "../../entities/audit/schema";
export * from "../../entities/comment/schema";
export * from "../../entities/notification/schema";
