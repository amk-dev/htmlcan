import { useState, useEffect, useCallback, useRef } from "react";

type SSEMessage =
  | { type: "pages"; pages: string[] }
  | { type: "change"; page: string };

export const usePages = () => {
  const [pages, setPages] = useState<string[]>([]);
  const listenersRef = useRef<Set<(page: string) => void>>(new Set());

  useEffect(() => {
    const eventSource = new EventSource("/__api/pages/stream");

    eventSource.onmessage = (event) => {
      const msg = JSON.parse(event.data) as SSEMessage;
      if (msg.type === "pages") {
        setPages(msg.pages);
      } else if (msg.type === "change") {
        for (const cb of listenersRef.current) {
          cb(msg.page);
        }
      }
    };

    return () => eventSource.close();
  }, []);

  const onPageChange = useCallback((cb: (page: string) => void) => {
    listenersRef.current.add(cb);
    return () => { listenersRef.current.delete(cb); };
  }, []);

  return { pages, onPageChange };
};
