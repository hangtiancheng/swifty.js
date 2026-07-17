/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Mongoose Project model.
 * Core data model: a project has multiple versions with grayscale weights.
 */
import mongoose from "mongoose";
import type { ProjectConfig } from "../types/index.js";

// ============================================================
// Version sub-document — mutable interface for Mongoose sub-docs
// ============================================================

/** Mutable version sub-document (Mongoose needs writable properties) */
interface MutableVersion {
  version: string;
  distPath: string;
  weight: number;
  isActive: boolean;
  createdAt: number;
}

const VersionSchema = new mongoose.Schema<mongoose.Document & MutableVersion>({
  version: { type: String, required: true },
  distPath: { type: String, required: true },
  weight: { type: Number, default: 100, min: 0, max: 100 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Number, default: () => Date.now() },
});

// ============================================================
// Project schema
// ============================================================

interface ProjectDocument extends mongoose.Document {
  name: string;
  description: string;
  versions: mongoose.Types.DocumentArray<MutableVersion>;
  defaultVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<ProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      match: /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/,
    },
    description: { type: String, default: "" },
    versions: [VersionSchema],
    defaultVersion: { type: String, default: "latest" },
  },
  { timestamps: true },
);

// ============================================================
// Model
// ============================================================

export const Project =
  (mongoose.models.Project as mongoose.Model<ProjectDocument>) ??
  mongoose.model<ProjectDocument>("Project", ProjectSchema);

// ============================================================
// Helper: convert lean DB doc to ProjectConfig
// ============================================================

interface LeanProject {
  name: string;
  description: string;
  versions: MutableVersion[];
  defaultVersion: string;
}

/** Convert a lean Mongoose document to ProjectConfig */
export function toProjectConfig(doc: LeanProject): ProjectConfig {
  return {
    name: doc.name,
    description: doc.description,
    versions: doc.versions.map((item) => ({
      version: item.version,
      distPath: item.distPath,
      weight: item.weight,
      isActive: item.isActive,
      createdAt: item.createdAt,
    })),
    defaultVersion: doc.defaultVersion,
  };
}
