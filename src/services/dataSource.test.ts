import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isDemoMode, loadResource, saveResource } from "@/services/dataSource";

describe("demo data source", () => {
  const values = new Map<string, string>();
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

  beforeEach(() => {
    values.clear();
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
  });

  afterEach(() => {
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("merges newly created records with the bundled demo fixtures", async () => {
    if (!isDemoMode) return;

    const demoRecords = [{ id: "seed", label: "Sample record" }];
    await saveResource("/test-records", { id: "created", label: "Created record" });

    await expect(loadResource("/test-records", demoRecords)).resolves.toEqual([
      { id: "seed", label: "Sample record" },
      { id: "created", label: "Created record" },
    ]);
  });
});
