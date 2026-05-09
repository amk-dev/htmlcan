import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  NodeToolbar,
  Position,
  NodeResizer,
  type Node,
  type NodeTypes,
  type NodeProps,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { memo, useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { PageEntry } from "@/lib/use-folder";
import { useCanvasStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Semaphore } from "@/lib/semaphore";
import { PillToggleToolbar } from "@/components/PillToggleToolbar";
import { useMountEffect } from "@/hooks/use-mount-effect";

type IframeNodeProps = {
  url: string | undefined;
  selected: boolean;
  onLoad?: () => void;
};

const IframeNode = memo(({ url, selected, onLoad }: IframeNodeProps) => {
  const [interactionMode, setInteractionMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!selected) setInteractionMode(false);
  }, [selected]);

  const handleDoubleClick = useCallback(() => {
    setInteractionMode(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setInteractionMode(false);
  }, []);

  const handleResizeStart = useCallback(() => {
    iframeRef.current?.classList.add("resizing");
  }, []);

  const handleResizeEnd = useCallback(() => {
    iframeRef.current?.classList.remove("resizing");
  }, []);

  return (
    <div
      className="iframe-node-container h-full w-full"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <NodeResizer
        isVisible={selected}
        handleClassName="!w-3 !h-3"
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />

      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {url ? (
          <iframe
            ref={iframeRef}
            src={url}
            className="iframe-content h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            onLoad={onLoad}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-neutral-900">
            <span className="text-xs text-neutral-500">Loading...</span>
          </div>
        )}
      </div>

      {!interactionMode && (
        <div
          className="absolute inset-0 z-10 cursor-grab"
          onDoubleClick={handleDoubleClick}
        />
      )}
    </div>
  );
});

type IframeNodeData = {
  url: string;
  pageName: string;
};

type IframeReactFlowNode = Node<IframeNodeData, "iframe">;

const iframeSemaphore = new Semaphore(10);

const IframeNodeRenderer = ({
  id,
  data,
  selected,
}: NodeProps<IframeReactFlowNode>) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    iframeSemaphore.acquire().then((release) => {
      if (cancelled) {
        release();
        return;
      }
      releaseRef.current = release;
      setUrl(data.url);
    });

    return () => {
      cancelled = true;
      releaseRef.current?.();
      releaseRef.current = null;
    };
  }, [data.url]);

  const handleLoad = useCallback(() => {
    releaseRef.current?.();
    releaseRef.current = null;
  }, []);

  const handleRefresh = useCallback(() => {
    // Force re-acquire by toggling url
    setUrl(undefined);
    setTimeout(() => setUrl(data.url), 0);
  }, [data.url]);

  const handleOpenExternal = useCallback(() => {
    const width = 1024;
    const height = 768;
    const left = Math.round(screen.width / 2 - width / 2);
    const top = Math.round(screen.height / 2 - height / 2);
    window.open(
      data.url,
      data.pageName,
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  }, [data.url, data.pageName]);

  return (
    <>
      <NodeToolbar position={Position.Top} align="start" isVisible={true} offset={8}>
        <PillToggleToolbar
          pageName={data.pageName}
          nodeId={id}
          selected={selected}
          onRefresh={handleRefresh}
          onOpenExternal={handleOpenExternal}
        />
      </NodeToolbar>
      <IframeNode url={url} selected={selected} onLoad={handleLoad} />
    </>
  );
};

const nodeTypes: NodeTypes = {
  iframe: IframeNodeRenderer,
};

const gridPatternStyle = {
  backgroundImage: "radial-gradient(#2d2d2d 1px, transparent 1px)",
  backgroundSize: "20px 20px",
} as const;

const GridPattern = () => (
  <div
    className="absolute inset-0 opacity-50 pointer-events-none"
    style={gridPatternStyle}
  />
);

const LAYOUT_KEY = "htmlcan-layouts";

type SavedLayout = {
  pageName: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const loadLayouts = (): SavedLayout[] => {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    return raw ? (JSON.parse(raw) as SavedLayout[]) : [];
  } catch {
    return [];
  }
};

const saveLayouts = (layouts: SavedLayout[]) => {
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts));
};

const CanvasContent = ({
  pages,
  className,
}: {
  pages: PageEntry[];
  className?: string;
}) => {
  const savedLayouts = useMemo(() => loadLayouts(), []);

  // Build a url lookup from pages prop
  const pageUrlMap = useMemo(
    () => new Map(pages.map((p) => [p.name, p.url])),
    [pages],
  );

  const initialNodes = useMemo<IframeReactFlowNode[]>(() => {
    const layoutMap = new Map(savedLayouts.map((l) => [l.pageName, l]));

    const withLayout: IframeReactFlowNode[] = [];
    const withoutLayout: PageEntry[] = [];

    for (const page of pages) {
      const saved = layoutMap.get(page.name);
      if (saved) {
        withLayout.push({
          id: `${page.name}-1`,
          type: "iframe" as const,
          position: { x: saved.x, y: saved.y },
          style: { width: saved.width, height: saved.height },
          data: { url: page.url, pageName: page.name },
        });
      } else {
        withoutLayout.push(page);
      }
    }

    const rightmost = withLayout.reduce<IframeReactFlowNode | null>(
      (acc, n) => (!acc || n.position.x > acc.position.x ? n : acc),
      null,
    );
    const baseX = rightmost ? rightmost.position.x : -400;
    const baseY = rightmost ? rightmost.position.y : 100;

    const newNodes = withoutLayout.map((page, index) => ({
      id: `${page.name}-1`,
      type: "iframe" as const,
      position: { x: baseX + 500 + index * 600, y: baseY },
      style: { width: 400, height: 300 },
      data: { url: page.url, pageName: page.name },
    }));

    return [...withLayout, ...newNodes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const layouts = nodesRef.current.map((n) => ({
        pageName: n.data.pageName,
        x: n.position.x,
        y: n.position.y,
        width: typeof n.style?.width === "number" ? n.style.width : 400,
        height: typeof n.style?.height === "number" ? n.style.height : 300,
      }));
      saveLayouts(layouts);
    }, 500);
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  const handleNodesChange = useCallback(
    (changes: NodeChange<IframeReactFlowNode>[]) => {
      onNodesChange(changes);

      const hasLayoutChange = changes.some(
        (c) => c.type === "position" || c.type === "dimensions",
      );
      if (hasLayoutChange) scheduleSave();
    },
    [onNodesChange, scheduleSave],
  );

  const handleNodesChangeRef = useRef(handleNodesChange);
  handleNodesChangeRef.current = handleNodesChange;

  useMountEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "page-size") return;
      const { pageName, width, height } = event.data as {
        type: string;
        pageName: string;
        width: number;
        height: number;
      };
      const node = nodesRef.current.find((n) => n.data.pageName === pageName);
      if (!node) return;
      handleNodesChangeRef.current([
        {
          id: node.id,
          type: "dimensions",
          dimensions: { width, height },
          setAttributes: true,
        },
      ]);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  // Sync pages: add new, remove deleted, update URLs for changed files
  useEffect(() => {
    setNodes((currentNodes) => {
      const existingNames = new Set(currentNodes.map((n) => n.data.pageName));
      const currentPageNames = new Set(pages.map((p) => p.name));

      const newPages = pages.filter((p) => !existingNames.has(p.name));
      const removedNames = new Set(
        currentNodes
          .map((n) => n.data.pageName)
          .filter((name) => !currentPageNames.has(name)),
      );

      // Update URLs for existing nodes whose blob URL changed (hot reload)
      let updated = currentNodes.map((n) => {
        const newUrl = pageUrlMap.get(n.data.pageName);
        if (newUrl && newUrl !== n.data.url) {
          return { ...n, data: { ...n.data, url: newUrl } };
        }
        return n;
      });

      // Remove deleted pages
      if (removedNames.size > 0) {
        updated = updated.filter((n) => !removedNames.has(n.data.pageName));
      }

      // Add new pages
      if (newPages.length > 0) {
        const maxX = Math.max(...updated.map((n) => n.position.x), 0);
        const additions = newPages.map((page, index) => ({
          id: `${page.name}-1`,
          type: "iframe" as const,
          position: { x: maxX + 500 + index * 600, y: 100 },
          style: { width: 400, height: 300 },
          data: { url: page.url, pageName: page.name },
        }));
        updated = [...updated, ...additions];
      }

      return updated;
    });
  }, [pages, pageUrlMap, setNodes]);

  // Focus on page when clicked in sidebar
  const reactFlow = useReactFlow();
  const focusPageName = useCanvasStore((s) => s.focusPageName);
  const setFocusPageName = useCanvasStore((s) => s.setFocusPageName);

  useEffect(() => {
    if (focusPageName) {
      const nodeId = `${focusPageName}-1`;
      reactFlow.fitView({
        nodes: [{ id: nodeId }],
        duration: 300,
        padding: 0.3,
      });
      setFocusPageName(null);
    }
  }, [focusPageName, reactFlow, setFocusPageName]);

  return (
    <div className={cn("h-full w-full bg-neutral-800 relative", className)}>
      <GridPattern />
      <ReactFlow
        nodes={nodes}
        onNodesChange={handleNodesChange}
        nodeTypes={nodeTypes}
        fitView
        maxZoom={4}
        minZoom={0.1}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={true}
        panOnScroll={true}
        panOnDrag={[1, 2]}
        onlyRenderVisibleElements={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
};

const GridPatternFull = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex-1 flex items-center justify-center bg-neutral-800 relative",
      className,
    )}
  >
    <GridPattern />
  </div>
);

type AppCanvasProps = {
  pages: PageEntry[];
  className?: string;
};

const GithubLink = () => (
  <a
    href="https://github.com/amk-dev/htmlcan"
    target="_blank"
    rel="noopener noreferrer"
    className="absolute bottom-4 right-4 z-10 text-neutral-600 hover:text-neutral-400 transition-colors"
  >
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  </a>
);

export const AppCanvas = ({ pages, className }: AppCanvasProps) => {
  if (pages.length === 0) {
    return (
      <div className={cn("relative", className)}>
        <GridPatternFull />
        <GithubLink />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div className={cn("relative h-full", className)}>
        <CanvasContent pages={pages} className="h-full" />
        <GithubLink />
      </div>
    </ReactFlowProvider>
  );
};
