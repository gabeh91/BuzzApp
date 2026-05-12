import { Directory, File, Paths } from "expo-file-system";

import {
  createFileSystemStorageAdapter,
  createResilientStorageAdapter,
} from "./storage";

export const fileStorage = createResilientStorageAdapter(
  createFileSystemStorageAdapter({
    deleteAsync: async (uri, options) => {
      const file = new File(uri);

      if (!file.exists && options?.idempotent) {
        return;
      }

      file.delete();
    },
    documentDirectory: Paths.document.uri,
    getInfoAsync: async (uri) => ({
      exists: new File(uri).exists,
    }),
    makeDirectoryAsync: async (uri) => {
      new Directory(uri).create({ idempotent: true, intermediates: true });
    },
    readAsStringAsync: async (uri) => new File(uri).text(),
    writeAsStringAsync: async (uri, value) => {
      const file = new File(uri);

      file.create({ intermediates: true, overwrite: true });
      file.write(value);
    },
  }),
);
