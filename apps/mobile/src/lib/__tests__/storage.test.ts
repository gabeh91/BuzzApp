import assert from "node:assert/strict";
import test from "node:test";

import {
  createFileSystemStorageAdapter,
  createMemoryStorageAdapter,
  createResilientStorageAdapter,
  createSecureStoreStorageAdapter,
  type StorageAdapter,
} from "../storage";

const createFailingStorage = (): StorageAdapter => ({
  getItem: async () => {
    throw new Error("Native module is null, cannot access legacy storage");
  },
  removeItem: async () => {
    throw new Error("Native module is null, cannot access legacy storage");
  },
  setItem: async () => {
    throw new Error("Native module is null, cannot access legacy storage");
  },
});

test("resilient storage falls back when the native storage adapter is unavailable", async () => {
  const storage = createResilientStorageAdapter(createFailingStorage());

  await storage.setItem("buzz.session", "stored");

  assert.equal(await storage.getItem("buzz.session"), "stored");

  await storage.removeItem("buzz.session");

  assert.equal(await storage.getItem("buzz.session"), null);
});

test("resilient storage uses the primary adapter when it is available", async () => {
  const primary = createMemoryStorageAdapter();
  const fallback = createMemoryStorageAdapter();
  const storage = createResilientStorageAdapter(primary, fallback);

  await storage.setItem("buzz.session", "primary");

  assert.equal(await primary.getItem("buzz.session"), "primary");
  assert.equal(await fallback.getItem("buzz.session"), null);
  assert.equal(await storage.getItem("buzz.session"), "primary");
});

test("secure store storage maps Expo SecureStore methods to the app storage interface", async () => {
  const calls: string[] = [];
  const values = new Map<string, string>();
  const storage = createSecureStoreStorageAdapter({
    deleteItemAsync: async (key) => {
      calls.push(`delete:${key}`);
      values.delete(key);
    },
    getItemAsync: async (key) => {
      calls.push(`get:${key}`);
      return values.get(key) ?? null;
    },
    setItemAsync: async (key, value) => {
      calls.push(`set:${key}:${value}`);
      values.set(key, value);
    },
  });

  await storage.setItem("buzz.session", "secure");
  assert.equal(await storage.getItem("buzz.session"), "secure");
  await storage.removeItem("buzz.session");

  assert.deepEqual(calls, [
    "set:buzz.session:secure",
    "get:buzz.session",
    "delete:buzz.session",
  ]);
});

test("file system storage persists values across adapter instances", async () => {
  const files = new Map<string, string>();
  const directories = new Set<string>();
  const fileSystem = {
    documentDirectory: "file:///documents/",
    deleteAsync: async (uri: string) => {
      files.delete(uri);
    },
    getInfoAsync: async (uri: string) => ({
      exists: files.has(uri) || directories.has(uri),
    }),
    makeDirectoryAsync: async (uri: string) => {
      directories.add(uri);
    },
    readAsStringAsync: async (uri: string) => {
      const value = files.get(uri);

      if (value === undefined) {
        throw new Error("File does not exist");
      }

      return value;
    },
    writeAsStringAsync: async (uri: string, value: string) => {
      files.set(uri, value);
    },
  };
  const firstAdapter = createFileSystemStorageAdapter(fileSystem, {
    directoryName: "buzz-test-storage",
  });

  await firstAdapter.setItem("buzz.anonymousOnboardingDraft.v1", "draft");

  const secondAdapter = createFileSystemStorageAdapter(fileSystem, {
    directoryName: "buzz-test-storage",
  });

  assert.equal(
    await secondAdapter.getItem("buzz.anonymousOnboardingDraft.v1"),
    "draft",
  );
});
