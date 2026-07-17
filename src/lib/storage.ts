import { get, set, del } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

/** zustand persist adapter over IndexedDB (idb-keyval) — survives offline periods
 *  and, with navigator.storage.persist(), storage pressure (PRD §13). */
export const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};
