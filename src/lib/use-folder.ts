import { useState, useEffect, useCallback, useRef } from "react";
import { saveFolder, loadFolders } from "./folder-store";

export type PageEntry = {
  name: string;
  url: string;
};

export type FolderEntry = {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
};

const readHtmlFiles = async (
  dirHandle: FileSystemDirectoryHandle,
): Promise<Map<string, { url: string; lastModified: number }>> => {
  const pages = new Map<string, { url: string; lastModified: number }>();

  for await (const [name, entry] of dirHandle.entries()) {
    if (entry.kind === "file" && name.endsWith(".html")) {
      const file = await (entry as FileSystemFileHandle).getFile();
      const content = await file.text();
      const blob = new Blob([content], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      pages.set(name.replace(/\.html$/, ""), {
        url,
        lastModified: file.lastModified,
      });
    }
  }

  return pages;
};

const POLL_INTERVAL = 1000;

export const useFolder = () => {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [dirHandle, setDirHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const prevUrlsRef = useRef<Map<string, string>>(new Map());
  const scanningRef = useRef(false);

  // Restore folders from IndexedDB on mount
  useEffect(() => {
    loadFolders()
      .then((stored) => {
        setFolders(stored.map((s) => ({ id: s.id, name: s.name, handle: s.handle })));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const revokeOldUrls = useCallback((oldUrls: Map<string, string>, newUrls: Map<string, string>) => {
    for (const [name, url] of oldUrls) {
      if (newUrls.get(name) !== url) {
        URL.revokeObjectURL(url);
      }
    }
  }, []);

  const scan = useCallback(async (handle: FileSystemDirectoryHandle) => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    try {
      const newFiles = await readHtmlFiles(handle);

      const newUrlMap = new Map<string, string>();
      const entries: PageEntry[] = [];
      for (const [name, { url }] of newFiles) {
        newUrlMap.set(name, url);
        entries.push({ name, url });
      }

      entries.sort((a, b) => a.name.localeCompare(b.name));

      revokeOldUrls(prevUrlsRef.current, newUrlMap);
      prevUrlsRef.current = newUrlMap;
      setPages(entries);
    } finally {
      scanningRef.current = false;
    }
  }, [revokeOldUrls]);

  const activateFolder = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setDirHandle(handle);
    setFolderName(handle.name);
    const stored = await saveFolder(handle);
    setActiveFolderId(stored.id);

    // Update folders list with latest from DB
    const all = await loadFolders();
    setFolders(all.map((s) => ({ id: s.id, name: s.name, handle: s.handle })));

    await scan(handle);
  }, [scan]);

  const selectFolder = useCallback(async (handle: FileSystemDirectoryHandle) => {
    const permission = await handle.requestPermission({ mode: "read" });
    if (permission !== "granted") return;
    await activateFolder(handle);
  }, [activateFolder]);

  const pickFolder = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker({ mode: "read" });
      await activateFolder(handle);
    } catch (e) {
      if ((e as DOMException).name !== "AbortError") throw e;
    }
  }, [activateFolder]);

  // FileSystemObserver or polling fallback
  useEffect(() => {
    if (!dirHandle) return;

    if ("FileSystemObserver" in window) {
      const observer = new (window as any).FileSystemObserver(() => {
        scan(dirHandle);
      });
      observer.observe(dirHandle, { recursive: false });
      return () => observer.disconnect();
    }

    let lastModMap = new Map<string, number>();

    const poll = async () => {
      try {
        const newFiles = new Map<string, number>();
        for await (const [name, entry] of dirHandle.entries()) {
          if (entry.kind === "file" && name.endsWith(".html")) {
            const file = await (entry as FileSystemFileHandle).getFile();
            newFiles.set(name, file.lastModified);
          }
        }

        let changed = newFiles.size !== lastModMap.size;
        if (!changed) {
          for (const [name, mod] of newFiles) {
            if (lastModMap.get(name) !== mod) {
              changed = true;
              break;
            }
          }
        }

        if (changed) {
          lastModMap = newFiles;
          await scan(dirHandle);
        }
      } catch {
        // folder may have been removed or permission revoked
      }
    };

    (async () => {
      for await (const [name, entry] of dirHandle.entries()) {
        if (entry.kind === "file" && name.endsWith(".html")) {
          const file = await (entry as FileSystemFileHandle).getFile();
          lastModMap.set(name, file.lastModified);
        }
      }
    })();

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [dirHandle, scan]);

  useEffect(() => {
    return () => {
      for (const url of prevUrlsRef.current.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return {
    pages,
    folderName,
    activeFolderId,
    folders,
    pickFolder,
    selectFolder,
    hasFolder: !!dirHandle,
    isLoading,
  };
};
