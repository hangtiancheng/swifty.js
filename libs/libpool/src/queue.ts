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

import Deque from "./deque.js";
import DoublyLinkedList from "./doubly-linked-list.js";
import ResourceRequest from "./resource-request.js";

export interface IQueueNode<T> {
  prev: IQueueNode<T> | null;
  next: IQueueNode<T> | null;
  data: T;
}

class Queue<T> extends Deque<ResourceRequest<T>> {
  override push(resourceRequest: ResourceRequest<T>): void {
    const node = DoublyLinkedList.createNode(resourceRequest);
    resourceRequest.promise.catch(this.createTimeoutRejectionHandler(node));
    this.list.insertEnd(node);
  }

  private createTimeoutRejectionHandler(
    node: IQueueNode<ResourceRequest<T>>,
  ): (reason?: any) => void {
    return (reason?: any) => {
      if (reason.name === "TimeoutError") {
        this.list.remove(node);
      }
    };
  }
}

export default Queue;
