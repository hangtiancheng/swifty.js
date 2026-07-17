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

import { describe, it, expect } from "vitest";
import DoublyLinkedList from "../src/doubly-linked-list.js";

describe("doubly-linked-list.test.ts", () => {
  it("test", () => {
    const dll = new DoublyLinkedList<{ id: number }>();

    const item1 = { id: 1 };
    const item2 = { id: 2 };
    const item3 = { id: 3 };
    const item4 = { id: 4 };

    dll.insertBeginning(DoublyLinkedList.createNode(item1));
    expect(dll.head?.data).toBe(item1);

    dll.insertEnd(DoublyLinkedList.createNode(item2));
    if (dll.tail) {
      expect(dll.tail.data).toBe(item2);

      dll.insertAfter(dll.tail, DoublyLinkedList.createNode(item3));
      expect(dll.tail.data).toBe(item3);

      dll.insertBefore(dll.tail, DoublyLinkedList.createNode(item4));
      expect(dll.tail.data).toBe(item3);

      dll.remove(dll.tail);
      expect(dll.tail.data).toBe(item4);
    }
  });
});
