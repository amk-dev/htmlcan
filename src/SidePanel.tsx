import { cn } from "@/lib/utils";
import { PagePanel } from "./PagePanel";
import { ResizablePanel } from "./components/ui/resizable-panel";
import type { PageEntry, FolderEntry } from "@/lib/use-folder";

type SidePanelProps = {
  pages: PageEntry[];
  folders: FolderEntry[];
  activeFolderId: string | null;
  onSelectFolder: (handle: FileSystemDirectoryHandle) => void;
  onOpenNew: () => void;
  className?: string;
};

export const SidePanel = ({
  pages,
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenNew,
  className,
}: SidePanelProps) => {
  return (
    <ResizablePanel className={cn("bg-neutral-800", className)}>
      <PagePanel
        pages={pages}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={onSelectFolder}
        onOpenNew={onOpenNew}
      />
    </ResizablePanel>
  );
};
