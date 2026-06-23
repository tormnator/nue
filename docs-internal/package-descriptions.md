# Nue Package Descriptions
*6/18/2026: I created this file because even after two months, I still didn't have a good understanding of the purpose of each of the Nue packages. The process was to take some notes on the packages, including existing package documentation, and then ask Copilot in VS Code to create a new and better description*.

## Summary

**[Nuekit](#nuekit)**
- **Tagline**: The build tool, dev server, and CLI that ties all of Nue together
- **Description**: The one package you install globally to create and run a Nue project. It processes your source files — HTML templates, Markdown, CSS, JavaScript, data — into a finished website. In development it watches for changes and hot-reloads the browser instantly. For production it pre-renders all pages to static HTML files ready to deploy anywhere.
- **Used where**: `nue create`, `nue serve`, `nue build`, `nue preview`
- **Depends on**: Nuedom, Nuemark, Nueyaml, Nuestate, Nueglow, Nueserver
- **Dependees**: none
- **Can be installed and used independently**: Yes — it is the main install (`bun install --global nuekit`)

**[Nuedom](#nuedom)**
- **Tagline**: Nue's HTML template engine and browser component runtime
- **Description**: Nuedom is the engine behind every page and interactive component in a Nue site. On the server it renders `.html` templates into HTML. In the browser it mounts those same templates as live, reactive components — responding to user actions and updating only what changed, with no virtual DOM. Both jobs use the same plain-HTML-with-expressions syntax.
- **Used where**: `nue serve`, `nue build`, client-side (browser)
- **Depends on**: none
- **Dependees**: Nuekit
- **Can be installed and used independently**: Yes — usable as a standalone template library or embedded in any JS/TS project

**[Nuemark](#nuemark)**
- **Tagline**: Markdown engine with a built-in component tag system for rich content
- **Description**: Nuemark renders your `.md` content files to HTML. Beyond standard Markdown it adds a clean tag syntax (`[image]`, `[accordion]`, `[codeblock]`, and any Nue component in scope) so content authors can embed structured, styled components without touching HTML or JSX.
- **Used where**: `nue serve`, `nue build`
- **Depends on**: Nueyaml, Nueglow
- **Dependees**: Nuekit
- **Can be installed and used independently**: Yes — works as a standalone Markdown renderer in any project

**[Nueserver](#nueserver)**
- **Tagline**: Minimal API route dispatcher for local dev and Cloudflare Workers
- **Description**: Nueserver is not a server — it is a request dispatcher. You register API routes with simple global functions (`get()`, `post()`, `use()`); Nueserver matches incoming requests and calls the right handler. The same route code runs unchanged in local development (inside Nuekit's dev server) and in production on Cloudflare Pages.
- **Used where**: `nue serve`, `nue build`, server-side (backend)
- **Depends on**: none
- **Dependees**: Nuekit
- **Can be installed and used independently**: Yes — usable as a standalone edge-compatible router

**[Nuestate](#nuestate)**
- **Tagline**: Client-side state management and SPA routing in one, URL-first
- **Description**: Nuestate runs in the browser only. It keeps your application's state in the URL by default, so bookmarking, sharing, and browser back/forward all work without extra code. It also handles client-side routing — there is no separate router to add. You include it when you need an SPA-style experience; leave it out for content-only sites.
- **Used where**: client-side (browser)
- **Depends on**: none
- **Dependees**: none (independent, opt-in — Nuekit serves it to the browser but does not import it)
- **Can be installed and used independently**: Yes — also usable via CDN with no build step

**[Nueyaml](#nueyaml)**
- **Tagline**: Predictable YAML parser — no type-guessing surprises
- **Description**: Nueyaml is a strict subset of YAML that eliminates the gotchas (`NO` staying `"NO"` instead of becoming `false`, `08080` staying a string instead of becoming octal, etc.). It parses all config and data files in a Nue project. One rule: if it looks like a string to a human, it is a string.
- **Used where**: `nue serve`, `nue build`
- **Depends on**: none
- **Dependees**: Nuekit, Nuemark
- **Can be installed and used independently**: Yes — a drop-in YAML parser for any project

**[Nueglow](#nueglow)**
- **Tagline**: Build-time syntax highlighter — semantic HTML output, styled by your own CSS
- **Description**: Nueglow highlights fenced code blocks in Markdown at build time, producing semantic HTML (keywords → `<b>`, strings → `<em>`, comments → `<sup>`, etc.) with no browser JavaScript at all. You bring the colors via CSS custom properties, so it fits naturally into any design system. Works across virtually any language without per-language grammar files.
- **Used where**: `nue serve`, `nue build`
- **Depends on**: none
- **Dependees**: Nuemark
- **Can be installed and used independently**: Yes — usable as a standalone code highlighter in any site generator

## Nuekit

### Overview

Nuekit is the build tool and development server for Nue. It is the one package you install globally to create and run a Nue project — everything else comes along with it. Nuekit ties all the other Nue packages together, takes your project's source files, figures out what goes where, and produces a complete website.

It has two distinct jobs:

**Build tool and development server** — Nuekit processes your project's files (HTML templates, Markdown content, CSS, JavaScript, data, SVGs) into a finished website. During development it watches for changes and hot-reloads the browser instantly. For production it pre-renders everything to static HTML files ready to deploy.

**Browser runtime coordinator** — Nuekit also ships a small set of JavaScript files to the browser that enable interactive components, client-side page navigation, and — during development — live reload without full page refreshes.

### Key terms

| Term | Meaning |
|---|---|
| **Asset** | Any file in your project — `.html`, `.md`, `.css`, `.js`, `.svg`, `yaml`, etc. |
| **Scope** | The folder a file lives in. Files in broader scopes (or `@shared/`) apply to more pages; files in narrower scopes apply only to pages in that folder. |
| **Dependency resolution** | Nuekit's automatic process of deciding which CSS, component, and data files apply to each page — based on folder scope, not explicit imports. |
| **System files** | The small set of runtime JS files Nuekit serves to the browser under `/@nue/` to enable component mounting, routing, and HMR. |
| **HMR** | Hot module replacement — live-updating the browser (CSS, content, components) without a full page reload. Development-only. |
| **SSG** | Static site generation — pre-rendering all pages to HTML files before any visitor arrives. Nue's default production mode. |

### The four CLI commands

Nuekit is used entirely through its command-line interface (`nue`):

**`nue create <template>`** — Scaffolds a new project from a starter template. Available templates: `minimal`, `blog`, `full`, `spa`. Downloads from GitHub and creates the project folder locally.

**`nue serve`** (or just `nue`) — Starts the development server. Watches all project files for changes and hot-reloads the browser. Renders pages on each request so edits appear immediately.

**`nue build`** — Pre-renders all pages to static HTML files in `.dist/`. This is the production output — deploy the contents of `.dist/` to any static hosting service.

**`nue preview`** — Serves the pre-built `.dist/` folder locally on port 4040 so you can verify the production output before deploying.

> [!NOTE]
> **For contributors:** `serve` and `build` share most of the same rendering code — the difference is that `serve` renders on each HTTP request (via `src/cmd/serve.js`) while `build` writes rendered output to disk (via `src/cmd/build.js`). `preview` does no rendering at all — it just serves static files from `.dist/`.

### Project setup and configuration

A Nue project needs only an `index.html` or `index.md` file to start. Configuration is optional and layered:

- **`site.yaml`** — Site-wide settings: title, metadata, design options, RSS, sitemaps, server routes, etc.
- **`app.yaml`** — Section-specific overrides. A `blog/app.yaml` applies only to pages under `blog/`.

Nuekit reads and merges these files at startup and on each change during development.

### Scope-based dependency resolution

One of Nuekit's most distinctive features is that you never write explicit imports for CSS or component files. Instead, Nuekit automatically resolves which files apply to each page based on folder structure:

- Files in **`@shared/`** subfolders (`@shared/ui/`, `@shared/design/`, `@shared/data/`) apply to every page on the site.
- Files at the **root level** apply site-wide after shared files.
- Files in a **subfolder** (e.g. `blog/`) apply only to pages in that folder.

This means adding a CSS file or a component to the right folder is enough — no import statements required.

> [!NOTE]
> **For contributors:** Dependency resolution lives in `src/deps.js` (`listDependencies`) and `src/asset.js` (`getDeps`, `sortHTMLAssets`). The resolution is scope-ranked: `@shared/` → root → subfolder, with `ui/` subfolders ranked above their parent. `app.yaml` files follow the same breadth-first cascade. The actual sorting logic for HTML component assets is in `sortHTMLAssets`, which uses a three-level rank: group (shared/root/nested), depth, ui-flag.

### Page assembly

When building or serving a page, Nuekit coordinates several packages to produce the final HTML:

1. **Data** — reads `site.yaml`, `app.yaml`, and any `.yaml`/`.json` data files in scope
2. **Content** — delegates to Nuemark for `.md` pages, or to Nuedom for `.html` pages
3. **Components** — resolves which Nue component files are in scope; Nuedom renders the layout slots (header, footer, sidebars, etc.)
4. **Head** — assembles `<title>`, meta tags, stylesheet `<link>` tags, and script tags
5. **Page shell** — wraps everything in `<!doctype html>` ... `</html>`

> [!NOTE]
> **For contributors:** Page assembly is in `src/render/page.js`. `renderMD` handles Markdown pages, `renderHTML` handles Nue template pages, `renderDHTML` handles interactive (dhtml) components — which produce both a stub HTML placeholder and a compiled `.js` module. `renderSlots` assembles the final page shell using plain template literals. SVG rendering is separate in `src/render/svg.js`.

### Browser runtime scripts

Nuekit ships a set of small JavaScript files to the browser at `/@nue/`. These are automatically included in pages that need them:

| File | Purpose | When included |
|---|---|---|
| `nue.js` | Nuedom runtime — mounts compiled components into the DOM | Any page with interactive components |
| `state.js` | Nuestate runtime — reactive global state | Any page using Nuestate |
| `mount.js` | Finds `[nue]` elements in the page and mounts the matching component | Any page with interactive components |
| `transitions.js` | Client-side page navigation — fetches new pages without full reloads, applies view transitions | When `view_transitions: true` in config |
| `hmr.js` | WebSocket client — receives change notifications from dev server and updates CSS/content/components live | Development only |
| `error.js` | Error overlay — displays template/script errors in the browser | Development only |

> [!NOTE]
> **For contributors:** System files are declared in `src/system.js`. `nue.js` is the Nuedom package's own `src/nue.js` entry (bundled). `state.js` is Nuestate's entry. The four client files (`hmr.js`, `mount.js`, `transitions.js`, `error.js`) live in `packages/nuekit/client/` and are served as-is (or minified in production).

### What Nuekit is not

- **Not a component library** — Nuekit contains no UI components. You write your own using Nuedom's HTML syntax.
- **Not a CSS framework** — Nuekit applies your CSS; it doesn't ship any.
- **Not a runtime** — For production, Nuekit produces static files. The only Nuekit "runtime" is the small set of browser scripts for interactivity and navigation.
- **Not a public library API** — Nuekit's internal functions (`createSite`, `build`, `serve`) are importable modules, but they are not documented as a public API. The intended interface is the CLI.

### Dependencies

Nuekit's `package.json` lists all other Nue packages as `dependencies`. These are all actively used in Nuekit's own code — not just bundled for end-users to install:

| Package | Used for |
|---|---|
| `nuedom` | Parsing, compiling, and rendering Nue `.html` templates |
| `nuemark` | Parsing and rendering Markdown content |
| `nueyaml` | Parsing `site.yaml`, `app.yaml`, and data files |
| `nuestate` | Served to the browser as `/@nue/state.js` |
| `nue-glow` | Syntax highlighting in code blocks |
| `nue-edgeserver` | Edge-compatible HTTP routing primitives for user-defined backend routes |


## Nuedom

> [!NOTE]
> The name "Nuedom" undersells the package. "dom" implies a simple DOM utility, but Nuedom is a full pipeline: HTML template language, parser, compiler, renderer, and browser runtime. The upstream README acknowledges this implicitly: *"Nuedom (or just 'Nue')"*. A more fitting name would be `nue-engine` — it covers both pillars (template engine + runtime), matches the description's own opening sentence, and avoids the wrong ecosystem connotations of alternatives like `nue-core`.

### Overview

Nuedom is the core engine of Nue. It has two main jobs:

**HTML template engine** — Nuedom takes `.html` files written in Nue's extended HTML syntax and renders them into HTML pages and layout components. This is what powers every page on a Nue site.

**Client-side reactive UI runtime** — Nuedom also runs in the browser. It mounts interactive components, responds to user actions, and updates only the parts of the page that changed — directly on the real DOM, with no virtual DOM layer.

Both jobs use the same template format: plain HTML extended with a small set of dynamic features. The same `.html` file can produce a server-rendered page and drive a browser-side interactive component.

It has no external runtime dependencies.

### Key terms

| Term | Meaning |
|---|---|
| **Parse** | Read a Nue `.html` template and build an in-memory AST (abstract syntax tree — a structured description of the template and its expressions) |
| **Compile** | Convert an in-memory AST to a JavaScript module file, transforming template expressions into real JS functions in the process |
| **Render** | Run an AST together with data to produce an HTML string. Happens in Bun/Node — not in the browser |
| **Mount** | Run an AST together with data to create live DOM nodes and insert them into the page. Happens in the browser |
| **Update** | Re-render a component subtree and patch only the changed DOM nodes when state changes |
| **SSG** | Static site generation — all pages are pre-rendered to HTML files before any user visits the site |

### Core feature 1: HTML template engine

Nuedom is the template engine for every HTML page and component in a Nue site. You write `.html` files in Nue's extended HTML syntax; Nuedom renders them to HTML.

For a typical content page (a `.md` file with a layout), Nuedom renders the layout frame — header, navigation, footer, sidebars, and any other surrounding components. The page content itself comes from Nuemark, Nue's markdown engine. For `.html` pages (non-markdown), Nuedom renders both the content and the layout.

This rendering happens in two contexts:

- **At build time** (`nue build`): All pages are pre-rendered to static HTML files in `dist/`. Visitors receive these files directly — no per-request processing (SSG).
- **During development** (`nue serve`): Pages are rendered on each HTTP request so your edits appear immediately without a build step.

Nue's production output is always SSG — static HTML files on disk. There is no production server-side rendering. The dev server's per-request rendering is a development convenience only.

> [!NOTE]
> **For contributors — the rendering process:**
> ```
> Template.html  ──[Parse]──> AST ──┐
> Component.html ──[Parse]──> AST ──┤
>                            Data ──┴──[Render]──> HTML string
> ```
> `renderNue` in `src/dom/render.js` drives this. It uses a lightweight fake DOM (`src/dom/fakedom.js`) so the same render code runs in Bun/Node without a real browser.
>
> Nuedom renders the layout slot components (header, footer, etc.) and `.html` page content. It does not render markdown — that is Nuemark's job. The final page shell (`<!doctype html>`, `<html>`, `<head>`, `<body>`) is assembled by Nuekit's own `renderSlots` function using plain template literals.

### Core feature 2: Client-side reactive UI runtime

For interactive parts of a page, Nuedom runs in the browser. It mounts components, wires up event handlers, and when state changes it re-renders and patches only what changed. There is no virtual DOM — diffing happens directly on the real DOM nodes. Updates touch only changed attributes and children.

This is the part end-users experience: button clicks, form submissions, live-updating lists, animated counters.

The browser runtime has two execution paths depending on how the component reached the browser:

**Compiled path** (normal Nuekit flow): The browser imports a pre-built `.js` file containing the component's AST baked in as a plain JS object. No parsing happens at load time — the component is immediately ready to mount.

**JIT path** (in-browser prototyping): A 2 KB browser entry (`nue-jit.js`) reads raw HTML from a `<template>` tag, parses it into an AST in the browser at page load, and mounts it immediately. No build step, no JS file — useful for experiments and standalone demos.

> [!NOTE]
> **For contributors — the two browser execution paths:**
>
> *Compiled path:*
> ```
>            JS module ──[Import]──> AST  ──┐
> Component JS modules ──[Import]──> ASTs ──┤
>                                    Data ──┴──[Mount]──> DOM
>                              State change ──[Update]──> DOM patch
> ```
> *JIT path (skips compile entirely):*
> ```
> <template> HTML ──[Parse]──> AST ──┐
>                             Data ──┴──[Mount]──> DOM
> ```
> The key difference: in the compiled path, `parseNue` ran at build time and the result was serialized to a `.js` file. In the JIT path, `parseNue` runs in the browser at page load on the raw HTML string.

### How compilation fits in

Between the template engine and the browser runtime sits a compile step. For interactive components, Nuekit uses `compileNue` to take the in-memory AST that parsing produces and serialize it to a JavaScript module file — converting template expressions like `{ count + 1 }` into real JS arrow functions along the way.

> [!NOTE]
> **For contributors — the compilation process:**
> ```
> Template.html ──[Parse]──> AST (expressions stored as strings)
>                                ──[Compile]──> JavaScript module
>                                     (string expressions become real JS functions;
>                                      AST exported as: export const lib = [...])
> ```
> `compileNue` in `src/compiler/compiler.js` handles this in two sub-steps: `inspect()` serializes the AST structure to a JS string, then `compileJS()` rewrites string-encoded expressions into proper JS arrow functions and function declarations. This is why "compile" is the right word — it's not just serialization, there is a code transformation step.

### The template syntax

Nuedom extends standard HTML with a small set of dynamic features. If you know HTML, you already know most of Nue.

| Feature | Syntax example |
|---|---|
| Text expression | `{ count }`, `{ count + 1 }` |
| Dynamic attribute | `:href="url"`, `:class="active ? 'on' : 'off'"` |
| Event handler | `:onclick="submit"`, `:oninput="filter"` |
| Conditional | `:if="logged_in"`, `:else-if="pending"`, `:else` |
| Loop | `:each="item in list"`, `:each="(item, i) in list"` |
| Component composition | Custom element tags, `:is="component-name"` |
| Component logic | `<script>` block inside the component element |
| SVG | Inline SVG elements, auto-namespaced |

Nuedom enforces separation of concerns: `style` attributes and `<style>` blocks are stripped at parse time. All CSS belongs in external `.css` files.

### Usage modes

**With Nuekit** — The normal way to build a Nue site or app. Nuekit handles file watching, routing, page assembly, and asset bundling. Nuedom runs underneath, doing the template work.

**Standalone library** — Install with `bun install nuedom` and call the API directly. Useful when embedding Nue rendering in your own server or build toolchain.

**In-browser JIT** — For experiments and standalone demos: reference `nuedom` via `esm.sh` and put your template in a `<template>` tag. No install, no build step.

```html
<head>
  <script src="//esm.sh/nuedom" type="module"></script>
</head>
<template>
  <button :onclick="count++">
    Count: <b>{ count }</b>
    <script>this.count = 0</script>
  </button>
</template>
```

> [!NOTE]
> esm.sh automatically proxies any package published to npm — no separate CDN step is needed. The docs reference `nuedom` (the upstream npm package name). The `@tormnator/nuedom` fork would be at `//esm.sh/@tormnator/nuedom`.

### Public API

When used as a standalone library, Nuedom exports three functions:

| Function | What it does |
|---|---|
| `renderNue(template, opts)` | Parse + Render: returns an HTML string. Accepts a template string or a pre-parsed AST. |
| `parseNue(template)` | Parse only: returns an in-memory AST. |
| `compileNue(template)` | Parse + Compile: returns a JavaScript module string ready to save as a `.js` file. |



## Nuemark

### Overview

Nuemark is Nue's Markdown engine. It takes `.md` files and renders them to HTML. Beyond standard Markdown, Nuemark adds a tag system that lets you embed structured components — grids, accordions, responsive images, custom Nue components — directly inside your content, using a clean indentation-based syntax rather than raw HTML or JSX.

It is the package responsible for all content pages in a Nue site. When Nuekit processes a `.md` file, Nuemark does the content rendering; Nuedom then renders the surrounding layout.

Dependencies: `nueyaml` (YAML front matter and tag attributes), `nue-glow` (syntax highlighting).

### What Nuemark adds to Markdown

Standard Markdown covers paragraphs, headings, lists, links, images, code blocks, and tables. Nuemark keeps all of that and adds:

**Tag syntax** — a block-level component syntax using `[tag-name arg="value"]` with optional indented body content. Built-in tags include:

| Tag | What it renders |
|---|---|
| `[image]` | Responsive `<figure>/<picture>` with caption, lazy loading, `small`/`large` srcset |
| `[accordion]` | `<details>`/`<summary>` accordion group |
| `[block]` | Generic `<div>` or `<dialog>` wrapper with section splitting |
| `[define]` | Definition list (`<dl>`) |
| `[codeblock]` | Syntax-highlighted code block (via nue-glow), with optional caption |

**Sections** — top-level `---` separators automatically wrap content into `<section>` elements, useful for landing pages.

**Front matter** — YAML block at the top of the file becomes the page's metadata (`title`, `description`, `date`, custom fields).

**Footnotes and reference links** — standard extended Markdown features.

**Custom tags via Nuekit** — when used through Nuekit, any Nue component in scope is automatically registered as a Markdown tag. A content author can write `[my-chart data="sales"]` in Markdown, and Nuedom renders the matching `.html` component.

> [!NOTE]
> **For contributors:** The custom tag integration is in Nuekit's `src/render/page.js` (`convertToTags`). It maps each in-scope Nue component AST to a Nuemark tag function that calls `renderNue`. Nuemark itself has no knowledge of Nuedom — the `tags` option in `doc.render({ tags })` is an open dictionary of functions.

### Public API

| Export | What it does |
|---|---|
| `nuemark(content, opts)` | Parse and render a Markdown string to HTML in one call |
| `parseNuemark(content)` | Parse to a document object — gives access to `render()`, `headings`, `meta`, `codeblocks` separately |
| `elem(tag, attr, content)` | Utility: build an HTML element string |
| `renderInline(text, opts)` | Render inline Markdown (bold, italic, links, etc.) to an HTML string |

`parseNuemark` is what Nuekit uses — it needs the `headings` and `meta` separately for page assembly before rendering the content.

### Standalone use

Nuemark has no dependency on Nuedom or Nuekit and can be used independently:

```js
import { parseNuemark } from 'nuemark'

const doc = parseNuemark(markdownString)
console.log(doc.meta.title)
console.log(doc.render())
```

## Nueserver

> [!NOTE]
> The name "Nueserver" overpromises. "Server" implies something that listens on a port, manages connections, and runs as a process — Nueserver does none of that. It is a request dispatcher: given a `Request`, it finds a matching route, calls its handler, and returns a `Response`. The actual listening is always done by something else (Bun in dev, Cloudflare Workers runtime in production). A more accurate name might be `nue-router` or `nue-worker`. The npm package name `nue-edgeserver` is a bit better but still carries the "server" weight.

### Overview

Nueserver is a minimal HTTP request dispatcher built around the Web platform's `fetch(request) → Response` model. It is **not** a server in the traditional sense — it doesn't listen on a port, start a process, or manage connections. It only routes an incoming `Request` to the right handler and returns a `Response`.

The actual serving happens at two different layers:
- **During development** (`nue serve`): Nuekit's dev server (Bun's built-in `Bun.serve()`) listens on a port and forwards API requests matching your registered routes to Nueserver for dispatching.
- **In production** (Cloudflare Pages): Nuekit bundles your routes together with Nueserver into a `_worker.js` file. Cloudflare's runtime calls Nueserver's exported `fetch` function directly for each incoming request.

Your route code is identical in both environments — that's the core promise of the package.

### What's in the package

A single JavaScript file (~140 lines). No dependencies. It exports:

| Export | What it is |
|---|---|
| `fetch(request, env)` | Main request handler. Walks the route table, finds a match, calls the handler, returns a `Response`. Returns 404 if nothing matches. |
| `routes` | The shared mutable route array. Nuekit clears it on hot-reload before re-importing your server file. |
| `matches(method, path)` | Quick pre-check used by Nuekit's dev server to decide whether to hand a request to Nueserver at all (avoids going through the full route table for every static file request). |
| `matchPath(pattern, path)` | Path-matching logic supporting `:param` segments and `*` wildcards. Also exported for testing. |
| `default { fetch }` | Cloudflare Workers expect this exact default-export shape. |

In addition, importing the package installs four functions on `globalThis`: `get()`, `post()`, `del()`, and `use()`. These push route entries into the shared `routes` array. Because they are globals, no import is needed in your route files.

> [!NOTE]
> **Global name collision risk**: The four globals `get`, `post`, `del`, `use` are injected into `globalThis`. Any other code that defines variables or functions with those names in the same runtime will silently collide. In practice this is constrained — route files run in Bun/Node where collisions are rare — but it is a design liability worth watching.

### Where it fits in Nue

You define your API routes in `@shared/server/index.js`. Nuekit discovers and loads this file. No imports are needed for the route registration functions:

```js
// @shared/server/index.js
get('/api/posts', async (c) => {
  const posts = await c.env.models.posts.getAll()
  return c.json(posts)
})

post('/api/posts', async (c) => {
  const data = await c.req.json()
  const post = await c.env.models.posts.create(data)
  return c.json(post, 201)
})

use('/api/*', async (c, next) => {
  if (!c.req.header('authorization')) return c.json({ error: 'Unauthorized' }, 401)
  return next()
})
```

The context object `c` provides:
- `c.req.param(key)` — URL path parameter (e.g. `:id`)
- `c.req.query(key)` — query string value
- `c.req.json()` / `c.req.text()` — parse the request body
- `c.req.header(key)` — read a request header
- `c.json(data, status?)` — return a JSON response
- `c.text(text, status?)` — return a plain-text response
- `c.status(code).json(data)` — return JSON with a specific status code
- `c.env` — the environment object (contains model accessors in dev, Cloudflare bindings in production)

### Cloudflare alignment

Nueserver is deliberately shaped around Cloudflare Workers conventions:

- The `fetch(request, env)` signature matches what Cloudflare Workers call.
- The default export `{ fetch }` is the exact shape Cloudflare Workers require.
- In local dev, Nuekit injects a set of mock Cloudflare request headers (`cf-ipcountry`, `cf-connecting-ip`, `cf-ray`, etc.) so your route handlers can read and use them the same way they will in production.

This is a deliberate design choice, not an accidental coupling — but it does mean Nueserver's production story is currently tied to Cloudflare's runtime model. Adapting it to another edge/serverless platform would require a different default export shape and a different `env` contract.

> [!NOTE]
> **For contributors — how request dispatching works:**
>
> ```
> fetch(request, env)
>   │
>   ├── createContext(request, env)  →  context object c
>   │
>   └── for each route in routes[]:
>         ├── skip if route.method ≠ request.method
>         ├── matchPath(route.path, pathname)
>         │     ├── returns { match: false }  →  skip
>         │     └── returns { match: true, params }  →  attach params to c.req
>         │
>         ├── no method (middleware)  →  handler(c, next)
>         │     └── if result is Response  →  return it
>         └── has method (route)     →  handler(c)
>               └── if result is Response  →  return it
>
>   No match found  →  Response('Not Found', 404)
> ```
>
> `matchPath` handles three patterns: exact segments (`/users`), named parameters (`/users/:id`), and trailing wildcards (`/admin/*`). The global wildcard `'*'` matches everything. Named parameters are extracted into the `params` object and exposed via `c.req.param(key)`.


## Nuestate

> [!NOTE]
> The existing README and docs page are identical — fine for a start, but the docs page should eventually be richer. Both are missing two important facts: (1) Nuestate is **client-side only** — it runs in the browser and touches `window`, `location`, `history`, `sessionStorage`, `localStorage`; there is no server-side use case. (2) It handles **both state and routing** in a single library — the "URL-first" tagline hints at this but doesn't say it plainly. No other Nue package depends on Nuestate; it is an independent, opt-in library.

### Overview

Nuestate is a **client-side** state management and client-side routing library in one. It runs in the browser only — it has no server-side use. The core idea is that the URL is the primary store for application state: instead of managing routing and state as two separate concerns (as React Router + Zustand/Redux do), Nuestate unifies them. Setting a state value automatically updates the URL; navigating to a URL automatically restores state.

The library is independent and opt-in. No other Nue package depends on it — you include it when you need SPA-style navigation or shared cross-component state, and leave it out otherwise.

In a Nuekit project, Nuestate is available via import map as `'state'`, so no path is needed:

```js
import { state } from 'state'
```

In standalone use (outside Nuekit), import it from a CDN or npm.

### What's in the package

A single JavaScript file (`src/state.js`, ~200 lines). No dependencies.

It exports:

| Export | What it is |
|---|---|
| `state` | A `Proxy` object — the main interface. Read and write state values as plain properties (`state.view = 'users'`). |
| `api` | The raw state API object underneath the proxy. Exposes `setup()`, `set()`, `on()`, `off()`, `emit()`, `init()`, `clear()`, `data`. |
| `getPathData(route, pathname)` | Parses `:param` values from a URL path against a route pattern. |
| `getQueryData(params, search)` | Reads named query-string parameters from a URL search string. |
| `renderPath(route, data)` | Fills a route pattern with data values to produce a URL path. |
| `renderQuery(params, data)` | Produces a query string from named parameters and a data object. |

### State storage contexts

When you call `state.setup()`, you declare which state keys belong to which storage context:

| Context | What it does | URL effect |
|---|---|---|
| `route` | Defines the URL path pattern with `:param` segments | `history.pushState` when a path param changes |
| `query` | Named query-string keys | `history.replaceState` when a query key changes |
| `session` | `sessionStorage` | None (survives page reload, not new tab) |
| `local` | `localStorage` | None (survives across sessions) |
| `memory` | In-memory only | None |
| `emit_only` | Fire events without saving state | None |

Only declared keys are tracked. Setting an undeclared key is silently ignored.

### Routing

Client-side routing is built in — there is no separate router. You configure it via `state.setup()`:

```js
state.setup({
  route: '/app/:section/:id',    // path params → pushState on change
  query: ['search', 'page'],     // query params → replaceState on change
  autolink: true                 // intercept <a href> clicks on matching paths
})
```

With `autolink: true`, Nuestate adds a document-level click listener. When a user clicks an `<a href>` whose path matches the configured route, Nuestate intercepts it, updates state from the link's URL, and prevents a full page reload. The `popstate` event (browser back/forward) is handled automatically.

### Event system

Listeners are registered with `state.on(names, fn)` and removed with `state.off(names, fn)`. The `names` string is space-separated and the callback receives only the changed keys:

```js
state.on('search filter', async ({ search, filter }) => {
  results = await fetchResults(search, filter)
})
```

Duplicate registrations are deduplicated — registering the same function string for the same names twice does nothing.

`state.emit(name, val)` fires an event without saving to any store. Only keys listed under `emit_only` in setup can be emitted this way.

### Type coercion

URL and storage values are always strings. Nuestate automatically coerces them on read: `'true'` → `true`, `'false'` → `false`, numeric strings → numbers, `null` → key removed from data. This means your listeners receive properly typed values without any manual conversion.

> [!NOTE]
> **For contributors — how a state write flows:**
>
> ```
> state.view = 'users'
>   │
>   └── Proxy.set → api.set({ view: 'users' })
>         │
>         ├── getChanges(currentData, { view: 'users' })
>         │     → only keys declared in setup() are tracked
>         │     → only changed values are kept
>         │     → returns { changes, at } where at is the set of
>         │       affected contexts ('path_params', 'query', etc.)
>         │
>         ├── save(changes)   → write to sessionStorage / localStorage / memory
>         ├── fire(changes)   → call matching state.on() listeners
>         └── pushURLState(at, data)
>               ├── path_params changed → history.pushState (new history entry)
>               └── query changed      → history.replaceState (same history entry)
> ```
>
> The `data` getter rebuilds state fresh on every read by merging `sessionStorage`, `localStorage`, URL path params, URL query params, and in-memory values — in that priority order. There is no cached state object; the URL and storage are always the source of truth.

## Nueyaml

### Overview

Nueyaml is a YAML parser — a deliberate, restricted subset of the YAML spec that eliminates the type-coercion rules responsible for most real-world YAML bugs. It is **not** a full YAML implementation: it intentionally rejects advanced YAML features (anchors, aliases, merge keys, custom tags, block scalar indicators) and replaces YAML's ambiguous type guessing with one simple rule: if it looks like a string to a human, it is a string.

Nueyaml is used throughout Nue as the standard format for configuration files and data files. It is **not** client-side — it runs only in Bun/Node, never in the browser.

### What's wrong with standard YAML

Standard YAML guesses your intent and often guesses wrong:

```yaml
country: NO       # becomes false  (Norway problem)
time: 12:30       # becomes 750    (sexagesimal seconds)
version: 1.10     # becomes 1.1    (float precision)
port: 08080       # becomes 4176   (octal)
```

These surprises come from the full YAML spec's attempt to auto-detect numbers, booleans, dates, and special literals in dozens of formats. The result is a parser that requires defensive quoting and careful memorisation of edge cases.

### How Nueyaml fixes it

One rule: only convert values that are *unambiguously* of a non-string type:

| Input | Standard YAML | Nueyaml |
|---|---|---|
| `NO` | `false` | `"NO"` |
| `12:30` | `750` | `"12:30"` |
| `1.10` | `1.1` | `1.1` |
| `08080` | `4176` | `"08080"` |
| `123` | `123` | `123` |
| `true` / `false` | `true` / `false` | `true` / `false` |
| `2024-01-15` | `Date` | `Date` |
| *(empty)* | `null` | `null` |

Numbers require no leading zeros and no colons. Booleans are only `true` and `false` (not `yes`, `on`, `True`, etc.). ISO dates in two formats are parsed to `Date` objects. Everything else is a string — no quotes needed.

### What's in the package

A single JavaScript file (`nueyaml.js`, ~350 lines). No dependencies.

The public API is two functions:

| Export | What it does |
|---|---|
| `parseYAML(text)` | Parses a full YAML string into a JS object or array. This is the main entry point used everywhere in Nue. |
| `parseYAMLArray(line)` | Parses an inline array from a single YAML line (`key: [a, b, c]`). Used by Nuekit's SVG renderer to parse style attributes. |

All other exports (`stripComments`, `measureIndent`, `detectIndentSize`, `validateIndentation`, `isNumber`, `parseValue`, `detectStructure`, `buildObject`) are internal helpers exposed for unit testing.

### Where it's used in Nue

| Package | What it parses |
|---|---|
| **Nuekit** | `site.yaml`, `app.yaml`, `.yaml` data files; SVG element style attributes (via `parseYAMLArray`) |
| **Nuemark** | YAML front matter in `.md` files; YAML option blocks on content tags |

Every configuration file and data file in a Nue project goes through Nueyaml.

### Supported syntax

Nueyaml supports the YAML subset used in real configuration files:

- **Key-value pairs** with any character in key names (including `/`, `:`, `@`)
- **Nested objects** via indentation (spaces only — tabs throw an error)
- **Block arrays** using `- ` list items
- **Inline arrays** using `[a, b, c]` syntax
- **Multi-line strings**: continuation lines under a bare key (no `|` or `>` required)
- **Comments** stripped with `#` (inline and full-line)

Unsupported (intentionally): anchors (`&`/`*`), aliases, merge keys (`<<`), YAML tags (`!!`), block scalar indicators (`|`, `>`), multiple document streams (`---`).

> [!NOTE]
> **For contributors — how `parseYAML` works:**
>
> ```
> parseYAML(text)
>   │
>   ├── validateIndentation(lines)
>   │     → reject tabs in leading whitespace
>   │     → detect base indent size from first indented line
>   │     → verify all indent levels are multiples of that size
>   │
>   ├── detectStructure(lines)
>   │     → tokenize each line into one of three block types:
>   │         keyvalue   { key, value, indent }
>   │         arrayitem  { value, indent }  or  { key, value, indent }
>   │         multiline  { value, indent }  (continuation text under a bare key)
>   │     → comments stripped, blank lines skipped
>   │
>   └── buildObject(blocks)
>         → iterate blocks; for each keyvalue:
>             - inline value  → parseValue() → scalar
>             - inline [...]  → parseYAMLArray() → array
>             - no value, children are arrayitems  → recurse into array of scalars or objects
>             - no value, children are multiline   → join as newline-separated string
>             - no value, children are keyvalue    → recurse into nested object
> ```
>
> `buildObject` is recursive. Array items that themselves have key-value children produce objects inside the array. Nesting depth is limited only by call stack.

## Nueglow

### The JS + CSS split (what's going on)

Nueglow has two completely separate halves that answer two different questions:

- **`index.js`** answers: *"How do I turn raw code text into structured HTML?"* — This JavaScript runs at build/render time (Bun/Node, server-side). It is never loaded in the browser.
- **`css/*.css`** answers: *"How do I make that HTML look like a syntax-highlighted code block?"* — These are reference CSS files that you copy and adapt. They are never auto-injected by Nuekit; you add them to your site's stylesheets yourself.

The two halves are coupled by a convention: the JS always emits specific HTML elements (`<b>`, `<em>`, `<sup>`, etc.) whose visual meaning is defined by the CSS.

### Overview

Nueglow is a build-time syntax highlighter. When Nuemark renders a fenced code block (`` ```js ... ``` ``), it calls `glow()` from Nueglow to convert the code into highlighted HTML. That HTML is baked into the static output at build time — no JavaScript runs in the browser to do syntax highlighting.

The design is deliberately different from tools like Shiki or Prism. Instead of per-language grammar files, Nueglow applies a small set of universal heuristics (detect strings, detect keywords, detect comments, detect operators/punctuation) that work reasonably well across virtually any language. The tradeoff: it isn't as precise as a grammar-based tool, but it requires zero configuration and adds zero weight to the browser bundle.

### What's in the package

**`index.js`** (~300 lines, no dependencies) exports:

| Export | What it does |
|---|---|
| `glow(str, opts)` | Main entry point. Takes a code string (or array of lines) and an options object, returns a `<code language="...">…</code>` HTML string ready to embed inside a `<pre>`. |
| `parseSyntax(lines, lang, prefix)` | Tokenizes lines into blocks, handling multi-line comments and line-prefix markers (`>`, `+`, `-`). |
| `parseRow(row, lang)` | Returns a sorted array of token positions for a single line. Exported for testing. |
| `renderRow(row, lang, mark)` | Wraps a single line's tokens in their respective HTML elements. Exported for testing. |

**`css/`** — reference stylesheets, not part of the npm package (`"files": ["index.js"]`):

| File | What it is |
|---|---|
| `syntax.css` | Base theme (dark mode). All colours are CSS custom properties. Copy this to start. |
| `light.css` | Example light theme. Overrides only the custom property values from `syntax.css`. |
| `markers.css` | Styles for diff/highlight line markers (`<ins>`, `<del>`, `<dfn>`). |
| `build.js` | Dev script (Bun) to minify the CSS files into a `minified/` folder. |

### Where it fits in Nue

Nueglow is a dependency of **Nuemark**. The call chain is:

```
Markdown with fenced code block
  → Nuemark render-blocks.js
      → glow(code, { language, numbered })
          → <code language="js">...</code>   ← baked into static HTML
```

It is also used by Nuekit indirectly through Nuemark. That is the only integration point — Nueglow is not a system file, not served to the browser, and has no footprint at runtime.

### The semantic HTML output

`glow()` maps code tokens to standard HTML elements based on their role:

| HTML element | Token type | Example |
|---|---|---|
| `<b>` | Keywords, identifiers, variable names | `const`, `function`, `myVar` |
| `<em>` | String values, numeric values | `"hello"`, `42` |
| `<strong>` | HTML tag names, special accents | `<div>`, `#ff0000` |
| `<i>` | Punctuation, operators, brackets | `(`, `=>`, `{` |
| `<sup>` | Comments (inline and block) | `// comment` |
| `<label>` | Decorators, special syntax | `@decorator`, heading in md |
| `<mark>` | Highlighted region (via `••…••` markers) | inline region |
| `<u>` | Error region (via `•••…•••` markers) | wavy underline |
| `<ins>` / `<del>` / `<dfn>` | Added / removed / highlighted lines | diff prefixes `+`, `-`, `>` |
| `<span>` | Line wrapper when `numbered: true` | CSS counter line numbers |

Your CSS styles these elements inside `pre { }`. Changing a few custom property values is all it takes to switch themes.

### Language support

Nueglow recognises a fixed vocabulary of common keywords (`const`, `function`, `return`, `class`, `import`, …) across most languages, plus language-specific additions for C++, Python, and Go. There are also special rules for CSS, JSON, and YAML, and a separate per-line heuristic path for Markdown/MDX.

Language is detected from the fenced code block identifier. If no language is given, `glow()` falls back to a default ruleset (HTML heuristics if the code starts with `<`, otherwise the generic set).

> [!NOTE]
> **For contributors — how `glow()` processes a block:**
>
> ```
> glow(str, opts)
>   │
>   ├── split into lines
>   ├── parseSyntax(lines, lang, prefix)
>   │     → for each line:
>   │         - if line starts a multi-line comment (/* { <!-- ''') → accumulate until end marker
>   │           → emit as { comment: [...lines] }
>   │         - else check for line-prefix marker (> + - \)
>   │           → strip prefix, emit as { line, wrap: 'dfn'|'ins'|'del' }
>   │         - else emit as { line, wrap: null }
>   │
>   └── for each block from parseSyntax:
>         - comment block   → each line wrapped in <sup>
>         - regular line    → renderRow(line, lang, opts.mark)
>             → parseRow: apply HTML_TAGS regex list in priority order,
>               collect { start, end, tag } token positions
>               → sort by start position, resolve overlaps
>               → wrap each token substring in its element
>             → apply ••region•• → <mark> and •••region••• → <u> replacements
>         - if wrap (ins/del/dfn) → wrap rendered line in that element
>         - if numbered → wrap in <span> for CSS counter
>   └── return <code language="lang">joined lines</code>
> ```

## Templates and www

These two folders live under `packages/` but are not npm packages — they have no published lifecycle and no other package depends on them.

### Templates

Four ready-to-use starter projects that Nuekit scaffolds when a user runs `nue create`:

- **minimal** — bare-bones: a single HTML file and a CSS file. The floor.
- **blog** — a multi-page blog with posts, an index page, and basic navigation.
- **full** — a complete website with multiple sections, shared layout components, and a blog.
- **spa** — a single-page application using Nuestate for client-side routing and state.

Each template ships as both a folder and a pre-built `.zip` file (used by Nuekit's `create` command to copy without requiring Git). They double as living integration examples — if a template builds clean, the whole pipeline is working.

### www

The source for [nuejs.org](https://nuejs.org) — the public Nue website and documentation. It is itself a Nue project, built with Nuekit, so it also serves as the most complete real-world integration test of the toolchain. The docs pages under `www/docs/` are the canonical end-user documentation for every package covered in this file.

`www` is marked `"private": true` and is never published.
