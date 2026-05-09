import { AppCanvas } from "./Canvas";
import { SidePanel } from "./SidePanel";
import { useFolder } from "@/lib/use-folder";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AvatarIcon } from "@/components/AvatarIcon";
import { FolderOpen } from "lucide-react";

const App = () => {
  const { pages, activeFolderId, folders, pickFolder, selectFolder, hasFolder, isLoading } = useFolder();

  if (isLoading) return null;

  if (!hasFolder) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-800">
        <div className="text-center">
          <h1 className="text-lg font-medium text-neutral-300 mb-2">htmlcan</h1>
          <p className="text-xs text-neutral-500 mb-6 max-w-[260px]">
            Select a folder containing HTML files to view them on the canvas.
          </p>

          {folders.length > 0 && (
            <div className="mb-6 max-w-[240px] mx-auto">
              <div className="text-[11px] text-neutral-600 uppercase tracking-wider mb-2">
                Recent folders
              </div>
              <div className="flex flex-col gap-1">
                {folders.map((folder) => (
                  <button
                    key={folder.name}
                    onClick={() => selectFolder(folder.handle)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-neutral-700/40 hover:bg-neutral-700 text-neutral-300 text-[13px] border-none cursor-pointer transition-colors font-[inherit] text-left"
                  >
                    <AvatarIcon name={folder.name} size={20} />
                    <span className="truncate">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={pickFolder}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-sm rounded-lg border-none cursor-pointer transition-colors font-[inherit]"
          >
            <FolderOpen size={16} />
            Open Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <SidePanel
          pages={pages}
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={selectFolder}
          onOpenNew={pickFolder}
        />
        <AppCanvas
          pages={pages}
          className="flex-1 border-l border-[#2d2d2d]"
        />
      </div>
    </TooltipProvider>
  );
};

export default App;
