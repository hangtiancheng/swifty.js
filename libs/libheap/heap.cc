// Copyright 2026 hangtiancheng
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "heap.h"

#include <cmath>
#include <functional>
#include <vector>

extern "C" {

struct HeapWrapper {
  std::vector<double> data;
  bool is_min_heap; // true = min heap, false = max heap

  std::function<int(double, double)> get_compare() const {
    if (is_min_heap) {
      return [](double a, double b) -> int {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      };
    }
    return [](double a, double b) -> int {
      if (a > b) {
        return -1;
      }
      if (a < b) {
        return 1;
      }
      return 0;
    };
  }
};

void *create(int is_min_heap) {
  HeapWrapper *h = new HeapWrapper();
  h->is_min_heap = (is_min_heap != 0);
  return static_cast<void *>(h);
}

void destroy(void *ctx) {
  if (ctx) {
    delete static_cast<HeapWrapper *>(ctx);
  }
}

void heapify(void *ctx, double *arr, int size) {
  if (!ctx || !arr || size <= 0) {
    return;
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  h->data.assign(arr, arr + size);
  libheap::heapify(h->data, h->get_compare());
}

double heappop(void *ctx) {
  if (!ctx) {
    return std::nan("");
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  if (h->data.empty()) {
    return std::nan("");
  }
  return libheap::heappop(h->data, h->get_compare());
}

void heappush(void *ctx, double item) {
  if (!ctx) {
    return;
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  libheap::heappush(h->data, item, h->get_compare());
}

double heappushpop(void *ctx, double item) {
  if (!ctx) {
    return std::nan("");
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  if (h->data.empty()) {
    return item;
  }
  return libheap::heappushpop(h->data, item, h->get_compare());
}

double heapreplace(void *ctx, double item) {
  if (!ctx) {
    return std::nan("");
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  if (h->data.empty()) {
    return std::nan("");
  }
  return libheap::heapreplace(h->data, item, h->get_compare());
}

int heapsize(void *ctx) {
  if (!ctx) {
    return 0;
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  return static_cast<int>(h->data.size());
}

double heappeek(void *ctx) {
  if (!ctx) {
    return std::nan("");
  }
  HeapWrapper *h = static_cast<HeapWrapper *>(ctx);
  if (h->data.empty()) {
    return std::nan("");
  }
  return h->data.front();
}

} // extern "C"
