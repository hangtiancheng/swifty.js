/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
