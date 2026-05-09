#!/usr/bin/env node

import { createServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const parseArgs = (args: string[]) => {
  let folder: string | undefined;
  let port: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--folder" || arg === "-f") {
      folder = args[++i];
    } else if (arg === "--port" || arg === "-p") {
      port = parseInt(args[++i] ?? "", 10);
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
  htmlcan - HTML canvas viewer

  Usage:
    npx htmlcan --folder <path>

  Options:
    -f, --folder <path>  Path to folder containing .html files (default: ./pages)
    -p, --port <port>    Port to run on (default: auto)
    -h, --help           Show this help
`);
      process.exit(0);
    } else if (!arg?.startsWith("-") && !folder) {
      folder = arg;
    }
  }

  return { folder, port };
};

const main = async () => {
  const { folder, port } = parseArgs(process.argv.slice(2));

  const resolvedFolder = folder
    ? path.resolve(process.cwd(), folder)
    : path.resolve(process.cwd(), "pages");

  if (!fs.existsSync(resolvedFolder)) {
    console.log(`\n  Creating ${resolvedFolder}\n`);
    fs.mkdirSync(resolvedFolder, { recursive: true });
  }

  process.env.HTMLCAN_FOLDER = resolvedFolder;

  const server = await createServer({
    root,
    configFile: path.resolve(root, "vite.config.ts"),
    server: {
      port: port ?? undefined,
      open: true,
    },
  });

  await server.listen();

  const info = server.config.server;
  const actualPort =
    server.httpServer?.address() &&
    typeof server.httpServer.address() === "object"
      ? (server.httpServer.address() as { port: number }).port
      : info.port;

  console.log(`
  htmlcan is running

  Canvas:  http://localhost:${actualPort}
  Folder:  ${resolvedFolder}

  Drop .html files into the folder and they'll appear on the canvas.
  Press Ctrl+C to stop.
`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
