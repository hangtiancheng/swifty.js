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

import { Collection, ObjectId, Db } from "mongodb";
import { type Prompt } from "../types.js";

export class PromptService {
  private collection: Collection<Prompt>;

  constructor(db: Db) {
    this.collection = db.collection<Prompt>("prompts");
  }

  async create(
    prompt: Omit<Prompt, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Prompt> {
    const now = new Date();
    const newPrompt: Prompt = {
      ...prompt,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(newPrompt);
    return { ...newPrompt, _id: result.insertedId };
  }

  async findAll(): Promise<Prompt[]> {
    return this.collection.find().toArray();
  }

  async findById(id: string): Promise<Prompt | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findByName(name: string): Promise<Prompt | null> {
    return this.collection.findOne({ name: { $regex: name, $options: "i" } });
  }

  async update(
    id: string,
    update: Partial<Omit<Prompt, "_id" | "createdAt" | "updatedAt">>,
  ): Promise<Prompt | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}
