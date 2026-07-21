#include <napi.h>

#include <cmath>
#include <vector>

#include "heap.h"

namespace {

struct NativeMinCompare {
  int operator()(double a, double b) const {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
};

class JsCompare {
public:
  JsCompare(Napi::Env env, Napi::Function fn) : env_(env), fn_(fn) {}

  // Napi::Function::Call throws Napi::Error (NAPI_CPP_EXCEPTIONS) when the
  // JS comparator itself throws, so a broken comparator cannot silently
  // corrupt the heap.
  int operator()(double a, double b) const {
    Napi::Value result =
        fn_.Call({Napi::Number::New(env_, a), Napi::Number::New(env_, b)});
    if (!result.IsNumber()) {
      throw Napi::TypeError::New(env_, "compare function must return a number");
    }
    double d = result.As<Napi::Number>().DoubleValue();
    if (d < 0) {
      return -1;
    }
    if (d > 0) {
      return 1;
    }
    return 0;
  }

private:
  Napi::Env env_;
  Napi::Function fn_;
};

double CheckedNumber(Napi::Env env, Napi::Value value) {
  if (!value.IsNumber()) {
    throw Napi::TypeError::New(env, "heap elements must be numbers");
  }
  double d = value.As<Napi::Number>().DoubleValue();
  if (std::isnan(d)) {
    throw Napi::TypeError::New(env,
                               "NaN is not allowed (it breaks heap ordering)");
  }
  return d;
}

std::vector<double> ArrayToVector(Napi::Env env, Napi::Array arr) {
  std::vector<double> vec;
  uint32_t len = arr.Length();
  vec.reserve(len);
  for (uint32_t i = 0; i < len; i++) {
    vec.push_back(CheckedNumber(env, arr.Get(i)));
  }
  return vec;
}

void WriteBack(Napi::Env env, Napi::Array arr, const std::vector<double> &heap) {
  for (size_t i = 0; i < heap.size(); i++) {
    arr.Set(static_cast<uint32_t>(i), Napi::Number::New(env, heap[i]));
  }
  // Growing happens automatically when setting an out-of-range index;
  // shrinking must be explicit.
  if (heap.size() < arr.Length()) {
    arr.As<Napi::Object>().Set(
        "length", Napi::Number::New(env, static_cast<double>(heap.size())));
  }
}

// Dispatches to a native comparator when no JS comparator is given, so the
// common numeric case never crosses the N-API boundary per comparison.
template <typename F>
decltype(auto) WithCompare(Napi::Env env, Napi::Value cmpValue, F &&body) {
  if (cmpValue.IsUndefined() || cmpValue.IsNull()) {
    return body(NativeMinCompare{});
  }
  if (!cmpValue.IsFunction()) {
    throw Napi::TypeError::New(env, "compare must be a function");
  }
  return body(JsCompare(env, cmpValue.As<Napi::Function>()));
}

Napi::Value OptionalArg(const Napi::CallbackInfo &info, size_t index) {
  if (info.Length() > index) {
    return info[index];
  }
  return info.Env().Undefined();
}

Napi::Value Heapify(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsArray()) {
    throw Napi::TypeError::New(env, "Expected (array, compareFunction?)");
  }
  Napi::Array arr = info[0].As<Napi::Array>();
  std::vector<double> heap = ArrayToVector(env, arr);
  WithCompare(env, OptionalArg(info, 1),
              [&](auto cmp) { libheap::heapify(heap, cmp); });
  WriteBack(env, arr, heap);
  return arr;
}

Napi::Value Heappop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsArray()) {
    throw Napi::TypeError::New(env, "Expected (array, compareFunction?)");
  }
  Napi::Array arr = info[0].As<Napi::Array>();
  if (arr.Length() == 0) {
    throw Napi::Error::New(env, "heap is empty");
  }
  std::vector<double> heap = ArrayToVector(env, arr);
  double result = WithCompare(env, OptionalArg(info, 1), [&](auto cmp) {
    return libheap::heappop(heap, cmp);
  });
  WriteBack(env, arr, heap);
  return Napi::Number::New(env, result);
}

Napi::Value Heappush(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsArray()) {
    throw Napi::TypeError::New(env, "Expected (array, number, compareFunction?)");
  }
  Napi::Array arr = info[0].As<Napi::Array>();
  double item = CheckedNumber(env, info[1]);
  std::vector<double> heap = ArrayToVector(env, arr);
  WithCompare(env, OptionalArg(info, 2),
              [&](auto cmp) { libheap::heappush(heap, item, cmp); });
  WriteBack(env, arr, heap);
  return env.Undefined();
}

Napi::Value Heappushpop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsArray()) {
    throw Napi::TypeError::New(env, "Expected (array, number, compareFunction?)");
  }
  Napi::Array arr = info[0].As<Napi::Array>();
  double item = CheckedNumber(env, info[1]);
  std::vector<double> heap = ArrayToVector(env, arr);
  double result = WithCompare(env, OptionalArg(info, 2), [&](auto cmp) {
    return libheap::heappushpop(heap, item, cmp);
  });
  WriteBack(env, arr, heap);
  return Napi::Number::New(env, result);
}

Napi::Value Heapreplace(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 2 || !info[0].IsArray()) {
    throw Napi::TypeError::New(env, "Expected (array, number, compareFunction?)");
  }
  Napi::Array arr = info[0].As<Napi::Array>();
  double item = CheckedNumber(env, info[1]);
  if (arr.Length() == 0) {
    throw Napi::Error::New(env, "heap is empty");
  }
  std::vector<double> heap = ArrayToVector(env, arr);
  double result = WithCompare(env, OptionalArg(info, 2), [&](auto cmp) {
    return libheap::heapreplace(heap, item, cmp);
  });
  WriteBack(env, arr, heap);
  return Napi::Number::New(env, result);
}

// Stateful heap: the data lives in C++, JS holds only the wrapper object.
// Every operation is O(log n) with no array copying, and the default numeric
// comparator never crosses the N-API boundary.
class Heap : public Napi::ObjectWrap<Heap> {
public:
  static Napi::Function GetClass(Napi::Env env) {
    return DefineClass(
        env, "Heap",
        {
            InstanceMethod<&Heap::Push>("push"),
            InstanceMethod<&Heap::Pop>("pop"),
            InstanceMethod<&Heap::Peek>("peek"),
            InstanceMethod<&Heap::Pushpop>("pushpop"),
            InstanceMethod<&Heap::Replace>("replace"),
            InstanceMethod<&Heap::ToArray>("toArray"),
            InstanceAccessor<&Heap::GetSize>("size"),
        });
  }

private:
  std::vector<double> data_;
  Napi::FunctionReference compare_;

  template <typename F> decltype(auto) WithOwnCompare(Napi::Env env, F &&body) {
    if (compare_.IsEmpty()) {
      return body(NativeMinCompare{});
    }
    return body(JsCompare(env, compare_.Value()));
  }

public:
  Heap(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Heap>(info) {
    Napi::Env env = info.Env();
    size_t idx = 0;
    if (info.Length() > idx && info[idx].IsArray()) {
      data_ = ArrayToVector(env, info[idx].As<Napi::Array>());
      idx++;
    }
    if (info.Length() > idx && !info[idx].IsUndefined() &&
        !info[idx].IsNull()) {
      if (!info[idx].IsFunction()) {
        throw Napi::TypeError::New(env, "compare must be a function");
      }
      compare_ = Napi::Persistent(info[idx].As<Napi::Function>());
    }
    if (!data_.empty()) {
      WithOwnCompare(env, [&](auto cmp) { libheap::heapify(data_, cmp); });
    }
  }

private:
  Napi::Value Push(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    double item = CheckedNumber(env, OptionalArg(info, 0));
    WithOwnCompare(env,
                   [&](auto cmp) { libheap::heappush(data_, item, cmp); });
    return env.Undefined();
  }

  Napi::Value Pop(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (data_.empty()) {
      throw Napi::Error::New(env, "heap is empty");
    }
    double result = WithOwnCompare(
        env, [&](auto cmp) { return libheap::heappop(data_, cmp); });
    return Napi::Number::New(env, result);
  }

  Napi::Value Peek(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    if (data_.empty()) {
      return env.Undefined();
    }
    return Napi::Number::New(env, data_.front());
  }

  Napi::Value Pushpop(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    double item = CheckedNumber(env, OptionalArg(info, 0));
    double result = WithOwnCompare(env, [&](auto cmp) {
      return libheap::heappushpop(data_, item, cmp);
    });
    return Napi::Number::New(env, result);
  }

  Napi::Value Replace(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    double item = CheckedNumber(env, OptionalArg(info, 0));
    if (data_.empty()) {
      throw Napi::Error::New(env, "heap is empty");
    }
    double result = WithOwnCompare(env, [&](auto cmp) {
      return libheap::heapreplace(data_, item, cmp);
    });
    return Napi::Number::New(env, result);
  }

  Napi::Value ToArray(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    Napi::Array arr = Napi::Array::New(env, data_.size());
    for (size_t i = 0; i < data_.size(); i++) {
      arr.Set(static_cast<uint32_t>(i), Napi::Number::New(env, data_[i]));
    }
    return arr;
  }

  Napi::Value GetSize(const Napi::CallbackInfo &info) {
    return Napi::Number::New(info.Env(),
                             static_cast<double>(data_.size()));
  }
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("heapify", Napi::Function::New(env, Heapify));
  exports.Set("heappop", Napi::Function::New(env, Heappop));
  exports.Set("heappush", Napi::Function::New(env, Heappush));
  exports.Set("heappushpop", Napi::Function::New(env, Heappushpop));
  exports.Set("heapreplace", Napi::Function::New(env, Heapreplace));
  exports.Set("Heap", Heap::GetClass(env));
  return exports;
}

} // namespace

NODE_API_MODULE(heap, Init)
