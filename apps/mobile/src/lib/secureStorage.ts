import * as SecureStore from "expo-secure-store";

import {
  createResilientStorageAdapter,
  createSecureStoreStorageAdapter,
} from "./storage";

export const secureStorage = createResilientStorageAdapter(
  createSecureStoreStorageAdapter(SecureStore),
);
