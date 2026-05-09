import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Check, FolderOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { AvatarIcon } from "@/components/AvatarIcon";
import type { FolderEntry } from "@/lib/use-folder";

type FolderSwitcherProps = {
  folders: FolderEntry[];
  activeFolderId: string | null;
  onSelectFolder: (handle: FileSystemDirectoryHandle) => void;
  onOpenNew: () => void;
};

export const FolderSwitcher = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onOpenNew,
}: FolderSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleSelect = (id: string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;
    onSelectFolder(folder.handle);
    close();
  };

  const handleNewFolder = () => {
    close();
    onOpenNew();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 py-1 px-2.5 bg-white/[0.06] border-none rounded-lg cursor-pointer hover:bg-white/[0.10] min-w-0 max-w-[200px] transition-colors"
        >
          {activeFolder && (
            <AvatarIcon name={activeFolder.name} size={18} />
          )}
          <span className="text-[13px] font-medium text-neutral-200 truncate flex-1">
            {activeFolder?.name ?? "Select folder"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-3 h-3 text-neutral-500 shrink-0" />
          ) : (
            <ChevronDown className="w-3 h-3 text-neutral-500 shrink-0" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[240px] p-1 bg-[#2c2c2c] border border-[#2d2d2d] rounded-lg shadow-lg overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command onKeyDown={(e) => { if (e.key === "Escape") close(); }}>
          <div className="flex items-center gap-2 py-1.5 px-2">
            <Search
              className={cn(
                "w-3 h-3 shrink-0 transition-colors",
                search ? "text-neutral-300" : "text-neutral-600",
              )}
            />
            <CommandInput
              ref={inputRef}
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
              className="text-[13px] placeholder:text-neutral-600"
            />
          </div>
          <CommandList className="max-h-[240px] px-1 pb-1">
            <CommandEmpty>No folders found</CommandEmpty>
            {folders.map((folder) => (
              <CommandItem
                key={folder.id}
                value={folder.id}
                keywords={[folder.name]}
                onSelect={() => handleSelect(folder.id)}
                className="group w-full flex items-center gap-2 py-1.5 px-2 border-none rounded-md text-left"
              >
                <AvatarIcon name={folder.name} size={18} />
                <span className="text-[13px] font-medium truncate flex-1 text-neutral-400 group-data-[selected=true]:text-neutral-200">
                  {folder.name}
                </span>
                {folder.id === activeFolderId && (
                  <Check className="w-3 h-3 text-neutral-500 shrink-0" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>

        <div className="-mx-1 border-t border-white/[0.06]" />
        <div className="pt-1">
          <button
            onClick={handleNewFolder}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border-none bg-transparent hover:bg-white/[0.06] text-[13px] font-medium text-neutral-500 hover:text-neutral-200 cursor-pointer transition-colors duration-[120ms]"
          >
            <FolderOpen className="w-3 h-3" />
            Add New Folder
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
