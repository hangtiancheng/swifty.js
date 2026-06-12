import { describe, it, expect, vi } from "vitest";
import { Service, Payload } from "../src/service";

describe("Payload", () => {
  it("constructor - default empty data", () => {
    const payload = new Payload();
    expect(payload.data).toEqual({});
  });

  it("constructor - with initial data", () => {
    const payload = new Payload({ key: "value" });
    expect(payload.data).toEqual({ key: "value" });
  });

  it("get - retrieves value by key", () => {
    const payload = new Payload({ name: "test", count: 42 });
    expect(payload.get("name")).toBe("test");
    expect(payload.get("count")).toBe(42);
  });

  it("get - returns undefined for non-existent key", () => {
    const payload = new Payload({});
    expect(payload.get("nonexistent")).toBeUndefined();
  });

  it("set - sets value with string key", () => {
    const payload = new Payload();
    const result = payload.set("key", "value");

    expect(result).toBe(payload); // Method chaining
    expect(payload.get("key")).toBe("value");
  });

  it("set - sets values in batch with object", () => {
    const payload = new Payload();
    payload.set({ a: 1, b: 2 });

    expect(payload.get("a")).toBe(1);
    expect(payload.get("b")).toBe(2);
  });

  it("set - overwrites existing value", () => {
    const payload = new Payload({ x: 1 });
    payload.set("x", 2);
    expect(payload.get("x")).toBe(2);
  });
});

describe("Service", () => {
  describe("constructor", () => {
    it("creates Service instance", () => {
      const service = new Service();
      expect(service.id).toBeDefined();
      expect(typeof service.id).toBe("string");
      expect(service.id.startsWith("s")).toBe(true);
    });
  });

  describe("extend", () => {
    it("creates subclass of Service", () => {
      const syncFn = vi.fn();
      const SubService = Service.extend(syncFn);

      expect(typeof SubService).toBe("function");
      const instance = new SubService();
      expect(instance.id).toBeDefined();
    });

    it("subclass inherits static methods", () => {
      const SubService = Service.extend(vi.fn());

      expect(typeof SubService.add).toBe("function");
      expect(typeof SubService.meta).toBe("function");
      expect(typeof SubService.create).toBe("function");
      expect(typeof SubService.cached).toBe("function");
      expect(typeof SubService.get).toBe("function");
      expect(typeof SubService.clear).toBe("function");
      expect(typeof SubService.extend).toBe("function");
    });
  });

  describe("add / meta", () => {
    it("add - registers single API metadata", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add({ name: "attr1", cache: 3.2, url: "/where" });

      const meta = SubService.meta("attr1");
      expect(meta.name).toBe("attr1");
      // cache is truncated to integer by |0
      expect(meta.cache).toBe(3);
    });

    it("add - registers API metadata in batch", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add([
        { name: "attr1", cache: 3, url: "/a" },
        { name: "attr2", cache: 5, url: "/b" },
      ]);

      expect(SubService.meta("attr1").cache).toBe(3);
      expect(SubService.meta("attr2").cache).toBe(5);
    });

    it("meta - returns input value for unknown name", () => {
      const SubService = Service.extend(vi.fn());
      const result = SubService.meta("unknownName");
      expect(result).toBe("unknownName");
    });

    it("meta - with object parameter", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add({ name: "testAttr", url: "/test" });

      const meta = SubService.meta({ name: "testAttr" });
      expect(meta.name).toBe("testAttr");
    });
  });

  describe("create / cached / get", () => {
    it("create - creates Payload instance", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add({ name: "testApi", cache: 100, url: "/api/test" });

      const payload = SubService.create({ name: "testApi" });
      expect(payload).toBeInstanceOf(Payload);
      expect(payload.cacheInfo).toBeDefined();
      expect(payload.cacheInfo?.name).toBe("testApi");
    });

    it("cached - returns undefined when no cache", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add({ name: "cachedTest", cache: 100, url: "/test" });

      const result = SubService.cached({ name: "cachedTest" });
      expect(result).toBeUndefined();
    });

    it("get - creates new instance when no cache", () => {
      const SubService = Service.extend(vi.fn());
      SubService.add({ name: "getTest", cache: 100, url: "/test" });

      const result = SubService.get({ name: "getTest" });
      expect(result.entity).toBeInstanceOf(Payload);
      expect(result.needsUpdate).toBe(true);
    });
  });

  describe("all / one / save", () => {
    it("all - calls syncFn to fetch data", async () => {
      const syncFn = vi.fn((payload, callback) => {
        payload.set({ result: "data" });
        callback();
      });

      const SubService = Service.extend(syncFn);
      SubService.add({ name: "fetchAll", cache: 0, url: "/fetch" });

      const service = new SubService();
      const done = vi.fn();

      service.all({ name: "fetchAll" }, done);

      // syncFn is asynchronous (via setTimeout)
      await new Promise((r) => setTimeout(r, 50));
      expect(syncFn).toHaveBeenCalled();
    });
  });

  describe("enqueue / dequeue / destroy", () => {
    it("enqueue - adds task to queue", () => {
      const service = new Service();
      const task = vi.fn();

      const result = service.enqueue(task);
      expect(result).toBe(service);
    });

    it("destroy - marks service as destroyed", () => {
      const service = new Service();
      service.destroy();
      // Should not process tasks after destruction
      expect(service["destroyed"]).toBe(1);
    });
  });

  describe("on / off / fire", () => {
    it("static event binding and triggering", () => {
      const SubService = Service.extend(vi.fn());
      const handler = vi.fn();

      SubService.on("begin", handler);
      SubService.fire("begin", { data: 1 });

      expect(handler).toHaveBeenCalledTimes(1);
      SubService.off("begin", handler);
    });
  });
});
