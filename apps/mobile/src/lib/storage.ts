export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setItem: (key: string, value: string) => Promise<void>;
};

type SecureStoreLike = {
  deleteItemAsync: (key: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
};

type FileSystemInfo = {
  exists: boolean;
};

type FileSystemLike = {
  deleteAsync: (
    uri: string,
    options?: { idempotent?: boolean },
  ) => Promise<void>;
  documentDirectory: string | null;
  getInfoAsync: (uri: string) => Promise<FileSystemInfo>;
  makeDirectoryAsync: (
    uri: string,
    options?: { intermediates?: boolean },
  ) => Promise<void>;
  readAsStringAsync: (uri: string) => Promise<string>;
  writeAsStringAsync: (uri: string, value: string) => Promise<void>;
};

export const createMemoryStorageAdapter = (): StorageAdapter => {
  const values = new Map<string, string>();

  return {
    getItem: async (key) => values.get(key) ?? null,
    removeItem: async (key) => {
      values.delete(key);
    },
    setItem: async (key, value) => {
      values.set(key, value);
    },
  };
};

export const createResilientStorageAdapter = (
  primary: StorageAdapter,
  fallback: StorageAdapter = createMemoryStorageAdapter(),
): StorageAdapter => {
  return {
    getItem: async (key) => {
      try {
        return await primary.getItem(key);
      } catch {
        return fallback.getItem(key);
      }
    },
    removeItem: async (key) => {
      try {
        await primary.removeItem(key);
      } catch {
        await fallback.removeItem(key);
      }
    },
    setItem: async (key, value) => {
      try {
        await primary.setItem(key, value);
      } catch {
        await fallback.setItem(key, value);
      }
    },
  };
};

export const createSecureStoreStorageAdapter = (
  secureStore: SecureStoreLike,
): StorageAdapter => {
  return {
    getItem: secureStore.getItemAsync,
    removeItem: secureStore.deleteItemAsync,
    setItem: secureStore.setItemAsync,
  };
};

const normalizeDirectoryUri = (uri: string): string => {
  return uri.endsWith("/") ? uri : `${uri}/`;
};

export const createFileSystemStorageAdapter = (
  fileSystem: FileSystemLike,
  options: { directoryName?: string } = {},
): StorageAdapter => {
  const directoryName = options.directoryName ?? "buzz-storage";

  const storageDirectory = (): string => {
    if (!fileSystem.documentDirectory) {
      throw new Error("File system document directory is unavailable");
    }

    return `${normalizeDirectoryUri(fileSystem.documentDirectory)}${directoryName}/`;
  };

  const fileUriForKey = (key: string): string => {
    return `${storageDirectory()}${encodeURIComponent(key)}.json`;
  };

  return {
    getItem: async (key) => {
      const uri = fileUriForKey(key);
      const info = await fileSystem.getInfoAsync(uri);

      if (!info.exists) {
        return null;
      }

      return fileSystem.readAsStringAsync(uri);
    },
    removeItem: async (key) => {
      await fileSystem.deleteAsync(fileUriForKey(key), { idempotent: true });
    },
    setItem: async (key, value) => {
      const directory = storageDirectory();

      await fileSystem.makeDirectoryAsync(directory, { intermediates: true });
      await fileSystem.writeAsStringAsync(fileUriForKey(key), value);
    },
  };
};
