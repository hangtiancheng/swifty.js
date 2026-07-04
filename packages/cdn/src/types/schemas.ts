/**
 * Zod validation schemas for API boundary validation.
 * All external data (API input, DB output) MUST be validated through these schemas.
 */
import { z } from "zod";

// ============================================================
// Version schemas
// ============================================================

/** Version creation schema */
export const VersionCreateSchema = z.object({
  version: z
    .string()
    .min(1, "Version string is required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Version must contain only alphanumeric, dot, hyphen, underscore"),
  distPath: z.string().min(1, "distPath is required"),
  weight: z.number().int().min(0).max(100).default(100),
  isActive: z.boolean().default(true),
});
export type VersionCreateInput = z.infer<typeof VersionCreateSchema>;

/** Version update schema (all fields optional) */
export const VersionUpdateSchema = z.object({
  version: z.string().min(1).optional(),
  distPath: z.string().min(1).optional(),
  weight: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});
export type VersionUpdateInput = z.infer<typeof VersionUpdateSchema>;

/** Version as stored in DB */
export const VersionDbSchema = z.object({
  version: z.string(),
  distPath: z.string(),
  weight: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  _id: z.any(),
});
export type VersionDb = z.infer<typeof VersionDbSchema>;

// ============================================================
// Project schemas
// ============================================================

/** Project creation schema */
export const ProjectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
      "Project name must start with alphanumeric and contain only alphanumeric, hyphen, underscore",
    ),
  description: z.string().default(""),
  defaultVersion: z.string().default("latest"),
  versions: z.array(VersionCreateSchema).default([]),
});
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;

/** Project update schema */
export const ProjectUpdateSchema = z.object({
  description: z.string().optional(),
  defaultVersion: z.string().optional(),
});
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

/** Project as stored in DB (lean) */
export const ProjectDbSchema = z.object({
  _id: z.any(),
  name: z.string(),
  description: z.string(),
  versions: z.array(VersionDbSchema),
  defaultVersion: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type ProjectDb = z.infer<typeof ProjectDbSchema>;

// ============================================================
// Publish schema
// ============================================================

/** Publish request schema — one-click register a dist directory */
export const PublishSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
      "Project name must start with alphanumeric and contain only alphanumeric, hyphen, underscore",
    ),
  version: z
    .string()
    .min(1, "Version string is required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Version must contain only alphanumeric, dot, hyphen, underscore"),
  distPath: z.string().min(1, "distPath is required"),
});
export type PublishInput = z.infer<typeof PublishSchema>;

// ============================================================
// API response schemas
// ============================================================

/** Standard API success response */
export const ApiResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

/** Standard API error response */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
