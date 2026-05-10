<div align="center">

# htmlcan

**HTML Canvas** &nbsp;/&nbsp; **HTML Can** &nbsp;/&nbsp; **HTML fucking CAN, bro**

An infinite canvas for your HTML files.  
Open a folder. See every page. Edit anywhere — it updates live.

[Website](https://htmlcan.com) &nbsp;&middot;&nbsp; [GitHub](https://github.com/amk-dev/htmlcan) &nbsp;&middot;&nbsp; [npm](https://www.npmjs.com/package/htmlcan)

</div>

---

HTML can do things markdown only dreams about — dashboards, interactive components, rich layouts, data visualizations. But previewing them means opening 15 tabs and alt-tabbing between files.

**htmlcan** gives you a canvas instead. Point it at a folder, and every `.html` file appears as a draggable, resizable, live-reloading card on an infinite 2D workspace.

## Why

- **See everything at once.** Compare layouts, components, and variations side by side on an infinite canvas — no tabs, no switching.
- **Edit anywhere, see it here.** Use VS Code, Vim, Cursor, or let an AI agent write HTML for you. Changes appear instantly via live reload.
- **AI-native workflow.** Tell Claude or ChatGPT to generate HTML files. Watch them materialize on your canvas in real time. Iterate visually.
- **Share with your team.** _Coming soon_ — collaborative workspaces so your whole team sees the same canvas.

## Quick Start

```bash
npx htmlcan
```

That's it. This creates a `pages/` folder, starts the viewer, and opens your browser.

Point it at an existing folder:

```bash
npx htmlcan -f ./my-html-files
```

Or install it:

```bash
npm install -g htmlcan
htmlcan --folder ./prototypes --port 4000
```

> **Note:** htmlcan requires a Chromium-based browser (Chrome, Edge, Arc, Brave) for the File System Access API.

## How It Works

```
┌─────────────────────────────────────────────────────┐
│  Your Editor / AI Agent                             │
│  (writes .html files to a folder)                   │
└──────────────┬──────────────────────────────────────┘
               │ file change detected
               ▼
┌─────────────────────────────────────────────────────┐
│  Vite Dev Server + Custom Plugin                    │
│  (watches folder, broadcasts changes via SSE)       │
└──────────────┬──────────────────────────────────────┘
               │ server-sent event
               ▼
┌─────────────────────────────────────────────────────┐
│  htmlcan Canvas (React + ReactFlow)                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ page │  │ page │  │ page │  │ page │  ← drag,   │
│  │  .html│  │  .html│  │  .html│  │  .html│  resize, │
│  └──────┘  └──────┘  └──────┘  └──────┘    zoom    │
└─────────────────────────────────────────────────────┘
```

1. **You write HTML** — by hand, with an editor, or with AI
2. **htmlcan detects changes** — via filesystem watcher + SSE
3. **The canvas updates live** — each file is an iframe card you can drag, resize, and interact with

## Features

**Canvas**
- Infinite pan & zoom workspace
- Drag and resize any page freely
- Double-click a card to interact with its content (forms, buttons, scroll)
- Press `Escape` to exit interaction mode
- Layout automatically saved and restored

**Live Reload**
- File changes broadcast via Server-Sent Events
- Sub-second updates — no manual refresh needed
- Works with any editor or tool that writes to the filesystem

**Folder Management**
- Switch between folders from the sidebar
- Recent folders remembered across sessions
- Sidebar with page list — click to focus & zoom

**CLI**
- `--folder, -f` — path to your HTML folder (default: `./pages`)
- `--port, -p` — dev server port (default: auto)

## The AI Workflow

htmlcan was built for the age of AI-generated UI. Here's the loop:

1. Ask an AI agent to generate HTML files — a dashboard, a component library, a prototype
2. The agent writes `.html` files to your folder
3. htmlcan picks them up instantly and renders them on the canvas
4. You see all variations at once, compare them visually, pick the best one
5. Ask the agent to iterate — watch the canvas update live

No copy-pasting into browser tabs. No screenshot comparisons. Just a canvas that stays in sync with your files.

## Development

```bash
git clone https://github.com/amk-dev/htmlcan.git
cd htmlcan
npm install
npm run dev
```

## Tech Stack

React 19 &middot; TypeScript &middot; Vite &middot; ReactFlow &middot; TailwindCSS 4 &middot; Zustand

## License

MIT
