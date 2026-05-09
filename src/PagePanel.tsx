import { FileText } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import { FolderSwitcher } from "@/components/FolderSwitcher";
import type { PageEntry, FolderEntry } from "@/lib/use-folder";

type PagePanelProps = {
  pages: PageEntry[];
  folders: FolderEntry[];
  activeFolderId: string | null;
  onSelectFolder: (handle: FileSystemDirectoryHandle) => void;
  onOpenNew: () => void;
};

export const PagePanel = ({
  pages,
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenNew,
}: PagePanelProps) => {
  const setFocusPageName = useCanvasStore((s) => s.setFocusPageName);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b border-[#2d2d2d] flex items-center">
        <FolderSwitcher
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={onSelectFolder}
          onOpenNew={onOpenNew}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {pages.length === 0 ? (
          <div className="text-[12px] text-neutral-500 px-2.5 py-2">
            No HTML files found
          </div>
        ) : (
          pages.map((page) => (
            <button
              key={page.name}
              onClick={() => setFocusPageName(page.name)}
              className="w-full flex items-center gap-2 py-2 px-2.5 border-none rounded-md cursor-pointer text-left bg-transparent hover:bg-white/[0.06] mb-0.5"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="text-[13px] text-neutral-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {page.name}.html
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
