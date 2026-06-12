import { describe, it, expect } from "vitest";
import { Framework } from "../src/framework";

describe("Framework", () => {
  describe("getConfig / setConfig (C7)", () => {
    it("getConfig() with no arg returns the live config object", () => {
      const cfg = Framework.getConfig();
      expect(cfg).toBeTypeOf("object");
      expect(typeof cfg.rootId).toBe("string");
    });

    it("getConfig(key) returns just that key", () => {
      Framework.setConfig({ rootId: "set-config-test-1" });
      expect(Framework.getConfig("rootId")).toBe("set-config-test-1");
    });

    it("getConfig(missingKey) returns undefined", () => {
      expect(
        Framework.getConfig("definitelyNotARealConfigKey_xyzzy"),
      ).toBeUndefined();
    });

    it("setConfig merges and returns the merged config", () => {
      const merged = Framework.setConfig({
        rootId: "set-config-test-2",
        defaultPath: "/home",
      });
      expect(merged.rootId).toBe("set-config-test-2");
      expect(merged.defaultPath).toBe("/home");
      // getConfig reads same store
      expect(Framework.getConfig("defaultPath")).toBe("/home");
    });

    it("deprecated config() still works — read all", () => {
      Framework.setConfig({ rootId: "set-config-test-3" });
      const all = Framework.config();
      expect(all.rootId).toBe("set-config-test-3");
    });

    it("deprecated config(key) still reads", () => {
      Framework.setConfig({ rootId: "set-config-test-4" });
      expect(Framework.config("rootId")).toBe("set-config-test-4");
    });

    it("deprecated config(patch) still writes", () => {
      Framework.config({ rootId: "set-config-test-5" });
      expect(Framework.getConfig("rootId")).toBe("set-config-test-5");
    });
  });

  describe("isBooted", () => {
    it("is a boolean", () => {
      expect(typeof Framework.isBooted()).toBe("boolean");
    });
  });
});
