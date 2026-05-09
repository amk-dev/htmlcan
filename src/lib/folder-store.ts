const DB_NAME = "htmlcan";
const STORE_NAME = "folders";
const DB_VERSION = 1;

export type StoredFolder = {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  lastOpened: number;
};

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const findExistingFolder = async (
  handle: FileSystemDirectoryHandle,
): Promise<StoredFolder | null> => {
  const all = await loadFolders();
  for (const folder of all) {
    if (await folder.handle.isSameEntry(handle)) {
      return folder;
    }
  }
  return null;
};

export const saveFolder = async (handle: FileSystemDirectoryHandle): Promise<StoredFolder> => {
  const existing = await findExistingFolder(handle);

  const entry: StoredFolder = {
    id: existing?.id ?? crypto.randomUUID(),
    name: handle.name,
    handle,
    lastOpened: Date.now(),
  };

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(entry);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return entry;
};

export const loadFolders = async (): Promise<StoredFolder[]> => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const request = tx.objectStore(STORE_NAME).getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results = (request.result as StoredFolder[]).sort(
        (a, b) => b.lastOpened - a.lastOpened,
      );
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

export const removeFolder = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
