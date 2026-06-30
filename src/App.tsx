import { AppCanvas } from "./Canvas";
import { SidePanel } from "./SidePanel";
import { useFolder } from "@/lib/use-folder";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AvatarIcon } from "@/components/AvatarIcon";
import { FolderOpen } from "lucide-react";

const isChromium = "showDirectoryPicker" in window;

const App = () => {
  const { pages, activeFolderId, folders, pickFolder, selectFolder, hasFolder, isLoading } = useFolder();

  if (isLoading) return null;

  if (!isChromium) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-800">
        <div className="text-center max-w-[320px]">
          <h1 className="text-lg font-medium text-neutral-300 mb-2">htmlcan</h1>
          <p className="text-sm text-neutral-400 mb-4">
            htmlcan requires the File System Access API, which is only available in Chromium-based browsers.
          </p>
          <p className="text-xs text-neutral-600">
            Please open this page in Chrome, Edge, or Arc.
          </p>
        </div>
      </div>
    );
  }

  if (!hasFolder) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-800 relative">
        <a
          href="https://github.com/amk-dev/htmlcan"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-neutral-600">
          built by{" "}
          <a
            href="https://x.com/buriedstupidity"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            buriedstupidity
          </a>
        </p>
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
