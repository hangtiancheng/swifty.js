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

import type { IDoublyLinkedList } from "./doubly-linked-list.js";
import DoublyLinkedListIterator from "./doubly-linked-list-iterator.js";

class DequeIterator<T> implements Iterator<T> {
  private readonly listIterator: DoublyLinkedListIterator<T>;

  constructor(list: IDoublyLinkedList<T>, reverse: boolean = false) {
    this.listIterator = new DoublyLinkedListIterator(list, reverse);
  }

  public next(): IteratorResult<T, undefined> {
    const result = this.listIterator.next();
    // unwrap the node
    if (result.done) {
      return { done: true, value: undefined };
    }
    return {
      value: result.value.data,
      done: false,
    };
  }

  public reset(): void {
    this.listIterator.reset();
  }

  public remove(): boolean {
    return this.listIterator.remove();
  }
}

export default DequeIterator;
