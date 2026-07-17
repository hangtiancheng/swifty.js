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

import DequeIterator from "./deque-iterator.js";
import DoublyLinkedList, {
  type IDoublyLinkedList,
} from "./doubly-linked-list.js";

class Deque<T> implements Iterable<T> {
  list: IDoublyLinkedList<T>;

  constructor() {
    this.list = new DoublyLinkedList<T>();
  }

  shift(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const node = this.list.head as any;
    this.list.remove(node);
    return node.data;
  }

  unshift(element: T): void {
    const node = DoublyLinkedList.createNode(element);
    this.list.insertBeginning(node);
  }

  push(element: T): void {
    const node = DoublyLinkedList.createNode(element);
    this.list.insertEnd(node);
  }

  pop(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const node = this.list.tail as any;
    this.list.remove(node);
    return node.data;
  }

  [Symbol.iterator](): Iterator<T> {
    return new DequeIterator<T>(this.list);
  }

  iterator(): DequeIterator<T> {
    return new DequeIterator<T>(this.list);
  }

  reverseIterator(): DequeIterator<T> {
    return new DequeIterator<T>(this.list, true);
  }

  get head(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const node = this.list.head;
    return node?.data;
  }

  get tail(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const node = this.list.tail;
    return node?.data;
  }

  get length(): number {
    return this.list.length;
  }
}

export default Deque;
