type FileSystemChangeRecord = {
  root: FileSystemHandle;
  changedHandle: FileSystemHandle;
  relativePathComponents: string[];
  type: "appeared" | "disappeared" | "modified" | "moved" | "unknown" | "errored";
};

type FileSystemObserverCallback = (
  records: FileSystemChangeRecord[],
  observer: FileSystemObserver,
) => void;

declare class FileSystemObserver {
  constructor(callback: FileSystemObserverCallback);
  observe(handle: FileSystemHandle, options?: { recursive?: boolean }): Promise<void>;
  unobserve(handle: FileSystemHandle): void;
  disconnect(): void;
}

export type { FileSystemChangeRecord, FileSystemObserverCallback };
export { FileSystemObserver };
