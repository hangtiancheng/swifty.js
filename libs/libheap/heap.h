/*
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

#ifndef LIBHEAP_HEAP_H
#define LIBHEAP_HEAP_H

#include <algorithm>
#include <functional>
#include <stdexcept>
#include <vector>

namespace libheap {

template <typename T, typename Compare>
void sift_down(std::vector<T> &heap, size_t index, Compare cmp) {
  size_t size = heap.size();
  while (true) {
    size_t smallest = index;
    size_t left = 2 * index + 1;
    size_t right = 2 * index + 2;
    if (left < size && cmp(heap[left], heap[smallest]) < 0) {
      smallest = left;
    }
    if (right < size && cmp(heap[right], heap[smallest]) < 0) {
      smallest = right;
    }
    if (smallest == index) {
      break;
    }
    std::swap(heap[index], heap[smallest]);
    index = smallest;
  }
}

template <typename T, typename Compare>
void sift_up(std::vector<T> &heap, size_t index, Compare cmp) {
  while (index > 0) {
    size_t parent = (index - 1) / 2;
    if (cmp(heap[index], heap[parent]) >= 0) {
      break;
    }
    std::swap(heap[index], heap[parent]);
    index = parent;
  }
}

template <typename T, typename Compare>
void heapify(std::vector<T> &heap, Compare cmp) {
  if (heap.size() <= 1) {
    return;
  }
  for (size_t i = heap.size() / 2; i-- > 0;) {
    sift_down(heap, i, cmp);
  }
}

template <typename T, typename Compare>
T heappop(std::vector<T> &heap, Compare cmp) {
  if (heap.empty()) {
    throw std::runtime_error("heap is empty");
  }
  T result = heap.front();
  heap[0] = heap.back();
  heap.pop_back();
  if (!heap.empty()) {
    sift_down(heap, 0, cmp);
  }
  return result;
}

template <typename T, typename Compare>
void heappush(std::vector<T> &heap, T item, Compare cmp) {
  heap.push_back(item);
  sift_up(heap, heap.size() - 1, cmp);
}

template <typename T, typename Compare>
T heappushpop(std::vector<T> &heap, T item, Compare cmp) {
  if (heap.empty() || cmp(item, heap.front()) <= 0) {
    return item;
  }
  T result = heap.front();
  heap[0] = item;
  sift_down(heap, 0, cmp);
  return result;
}

template <typename T, typename Compare>
T heapreplace(std::vector<T> &heap, T item, Compare cmp) {
  if (heap.empty()) {
    throw std::runtime_error("heap is empty");
  }
  T result = heap.front();
  heap[0] = item;
  sift_down(heap, 0, cmp);
  return result;
}

template <typename T> int default_compare(const T &a, const T &b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

} // namespace libheap

#endif // LIBHEAP_HEAP_H
