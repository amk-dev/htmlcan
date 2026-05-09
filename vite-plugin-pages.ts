import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

type SSEClient = {
  res: {
    write: (data: string) => void;
    on: (event: string, cb: () => void) => void;
  };
};

type SSEMessage =
  | { type: "pages"; pages: string[] }
  | { type: "change"; page: string };

export const pagesPlugin = (folder?: string): Plugin => {
  const pagesDir = path.resolve(folder ?? path.join(process.cwd(), "pages"));
  const clients: SSEClient[] = [];

  const getPages = () => {
    if (!fs.existsSync(pagesDir)) return [];
    return fs
      .readdirSync(pagesDir)
      .filter((f) => f.endsWith(".html"))
      .map((f) => f.replace(/\.html$/, ""));
  };

  const send = (msg: SSEMessage) => {
    const data = `data: ${JSON.stringify(msg)}\n\n`;
    for (const client of clients) {
      client.res.write(data);
    }
  };

  const broadcastPages = () => send({ type: "pages", pages: getPages() });

  const broadcastChange = (filePath: string) => {
    const page = path.basename(filePath, ".html");
    send({ type: "change", page });
  };

  const isPageFile = (filePath: string) =>
    filePath.startsWith(pagesDir) && filePath.endsWith(".html");

  return {
    name: "vite-plugin-pages",
    configureServer(server) {
      server.watcher.add(pagesDir);
      server.watcher.on("add", (fp) => { if (isPageFile(fp)) broadcastPages(); });
      server.watcher.on("unlink", (fp) => { if (isPageFile(fp)) broadcastPages(); });
      server.watcher.on("change", (fp) => { if (isPageFile(fp)) broadcastChange(fp); });

      server.middlewares.use((req, res, next) => {
        if (req.url === "/__api/pages") {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(getPages()));
          return;
        }

        if (req.url === "/__api/pages/stream") {
          res.setHeader("Content-Type", "text/event-stream");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("Connection", "keep-alive");

          send({ type: "pages", pages: getPages() });

          const client: SSEClient = { res };
          clients.push(client);

          req.on("close", () => {
            const idx = clients.indexOf(client);
            if (idx !== -1) clients.splice(idx, 1);
          });
          return;
        }

        if (req.url?.startsWith("/pages/") && req.url.endsWith(".html")) {
          const filePath = path.join(
            pagesDir,
            req.url.replace("/pages/", ""),
          );
          if (fs.existsSync(filePath)) {
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Cache-Control", "no-store");
            res.end(fs.readFileSync(filePath, "utf-8"));
            return;
          }
        }

        next();
      });
    },
  };
};
