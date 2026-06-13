# Nue Conventions Reference

This document provides a comprehensive reference of all naming conventions, magic folders, special files, and implicit behaviors in the Nue framework. The contents are generated from the Nue documentation pages and from its source code (see [Revision History](#revision-history) for more).

---

## Table of Contents

1. [Special Directories](#special-directories)
2. [Special File Names](#special-file-names)
3. [File Extensions and Types](#file-extensions-and-types)
4. [Configuration Files](#configuration-files)
5. [HTML Doctype Conventions](#html-doctype-conventions)
6. [Routing Conventions](#routing-conventions)
7. [Asset Loading and Dependencies](#asset-loading-and-dependencies)
8. [Layout Module Conventions](#layout-module-conventions)
9. [Naming Patterns](#naming-patterns)
10. [Data Hierarchy and Precedence](#data-hierarchy-and-precedence)
11. [Reserved Property Names](#reserved-property-names)
12. [Quick Reference Tables](#quick-reference-tables)
13. [Tips for Development by Discovery](#tips-for-development-by-discovery)
14. [See Also](#see-also)
15. [Revision History](#revision-history)

---

## Special Directories

### The `@shared` Directory (System-Level)

The `@shared` directory is Nue's special system-level directory with hardcoded subdirectories that have automatic behaviors:

#### Auto-Included Subdirectories

These directories are **automatically included** on every page:

- **`@shared/design/`** - CSS design system files (`.css`)
  - Auto-loaded on all pages
  - Loaded before root-level assets
  - Establishes the foundation for your design system

- **`@shared/ui/`** - UI components and controllers
  - `.html` files: Server-side components, client-side components, or isomorphic
  - `.js` and `.ts` files: UI controllers that run globally
  - `.css` files: Component-specific styles
  - Auto-loaded on every page in the application

- **`@shared/data/`** - Global data files
  - `.yaml` and `.json` files: Automatically merged into template data
  - `.js` and `.ts` files: Data transformation scripts (must export `default` function)
  - Server-side only - not sent to client

#### Opt-In Subdirectories

These directories require explicit imports:

- **`@shared/lib/`** - Third-party libraries and selective UI components
  - Use via `import_map` in `site.yaml`
  - Not auto-included (selective loading)
  - Example: `d3.js`, `utils.js`, custom libraries

- **`@shared/app/`** - Business logic and data models
  - Use via `import_map` in `site.yaml`
  - Contains your application's core logic separate from UI
  - Example structure: `users.js`, `payments.js`, `analytics.js`

- **`@shared/server/`** - Backend server code
  - Default directory for server routes (configurable via `server.dir` in `site.yaml`)
  - Must export route handlers using Nueserver API (`get`, `post`, `del`, etc.)
  - Entry point: `@shared/server/index.js`
  - Data subdirectory: `@shared/server/data/` for CloudFlare-compatible datastores

- **`@shared/test/`** - Test files
  - Automatically ignored by the build system
  - Never included in builds

### Application Directories

Any directory at the root level (other than `@shared`) is treated as an application area:

- **`blog/`** - Example application area
- **`docs/`** - Example application area
- **`admin/`** - Example application area
- **`login/`** - Example application area

#### Application `ui/` Subdirectory

Each application can have its own `ui/` subdirectory:

- **`blog/ui/`** - Blog-specific components
- **`admin/ui/`** - Admin-specific components

Components in these directories are only loaded for pages within that application area.

### The `home/` Directory

Special directory for home page assets:

- Only loaded for the root `index.md` or `index.html`
- Separates home page assets from globally shared assets
- Example: `home/layout.css`, `home/home.yaml`

### Reserved/Ignored Directories

These are **always ignored** during builds:

- `node_modules/`
- Any directory ending in `.toml`, `.rs`, `.lock`, `.lockb`
- Directories specified in `site.skip` configuration
- `@shared/server/` (backend code directory)
- `@shared/test/` (test files)

You can extend the ignore list via `site.yaml`:

```yaml
site:
  skip: [test/, @plans/, drafts/]
```

---

## Special File Names

### `site.yaml`

**Location:** Project root  
**Purpose:** Global site configuration  
**Properties:**
- `site`: Site-wide behavior settings
- `meta`: Default metadata for all pages
- `design`: Design system configuration
- `server`: Server infrastructure settings
- `collections`: Content collection definitions
- `sitemap`: Sitemap generation settings
- `rss`: RSS feed settings
- `content`: Content processing defaults
- `import_map`: Client-side import mappings
- `links`: Global link definitions for Nuemark
- `production`: Production environment overrides

**Note:** Configuration properties are filtered out of template data. Only custom properties and metadata become available to templates.

### `app.yaml`

**Location:** Any application directory (e.g., `blog/app.yaml`, `admin/app.yaml`)  
**Purpose:** Directory-specific configuration overrides  
**Properties:** Same as `site.yaml` but scoped to the directory  
**Overrides:** Extends or overrides `site.yaml` settings for pages in that directory

### `layout.html`

**Location:** 
- Root: `layout.html` (global layouts)
- Application: `blog/layout.html` (blog-specific layouts)
- Page: `blog/post/layout.html` (page-specific layouts)

**Purpose:** Layout modules (header, footer, navigation, etc.)  
**Doctype:** Typically `<!doctype html lib>` or `<!html lib>`  
**Behavior:** Modules are auto-assembled around page content

**Override Hierarchy:**
1. More specific layouts override global ones
2. `blog/layout.html` overrides root `layout.html` for blog pages
3. Page-level front matter overrides everything

### `index.html` and `index.md`

**Location:** Any directory  
**Purpose:** Directory index/landing page

**Special Behaviors:**

1. **Routing:** Maps to the directory URL with trailing slash
   - `index.html` → `/`
   - `blog/index.md` → `/blog/`
   - `contact/index.md` → `/contact/`

2. **Single-Page Applications:**
   - `app/index.html` with `<!doctype dhtml>` becomes an SPA
   - Automatically includes **all assets** from the directory tree
   - Handles all routes within that directory (e.g., `/app/*`)

3. **Home Directory:**
  - Root `index.md` and `index.html` automatically include assets from `home/` directory

### `404.md` or `404.html`

**Location:** Project root  
**Purpose:** Custom error page for not-found routes  
**Behavior:**
- Automatically served when a route doesn't match any file
- Returns HTTP 404 status
- Can use full layout system and templates

### Template Files

Any file matching these patterns in a directory:

- **`site.html`** - Global layout modules (alternative to `layout.html`)
- **`{dirname}.html`** - App-specific components (e.g., `blog/blog.html`)
- **`components.html`** - Generic component library name
- **Files in `ui/` directory** - Automatically discovered

---

## File Extensions and Types

### `.html` - HTML Files

**Determined by doctype or content:**

1. **Server-side HTML pages:** `<!doctype html>`
   - Generates complete HTML documents during build
   - For static content, landing pages, server-rendered templates

2. **Dynamic HTML pages:** `<!doctype dhtml>`
   - Client-rendered with interactive behavior
   - Mounts and runs in the browser
   - For interactive pages, forms, dashboards, SPAs

3. **HTML libraries:** `<!html lib>`
   - Server-side reusable components
   - Used in other HTML pages and Nuemark content

4. **DHTML libraries:** `<!dhtml lib>`
   - Client-side interactive components
   - For use in dynamic pages

5. **Isomorphic libraries:** `<!html+dhtml>` or `<!doctype html+dhtml>`
   - Work on both server and client
   - Essential for design systems

6. **Raw HTML pages:** `<!doctype html>` with `<html>` or `<head>` at root
   - Passed through without Nue processing

**Auto-detection:** When doctype is omitted, Nue detects type based on:
- Event handlers (`:onclick`, etc.) → DHTML
- JavaScript imports → DHTML
- All custom elements → Library
- Pure content → HTML

### `.md` - Markdown Files

**Purpose:** Content files using Nuemark syntax  
**Features:**
- Optional YAML front matter (delimited by `---`)
- Extended Markdown with custom tags
- Compiled to HTML during build
- Can use layout modules

**URL Mapping:**
- `about.md` → `/about/`
- `blog/post.md` → `/blog/post`
- `index.md` → `/`

### `.css` - Stylesheets

**Auto-loaded based on hierarchy:**
1. `@shared/design/*.css` - Global design system (all pages)
2. Root level `*.css` - Global styles (all pages)
3. `blog/blog.css` - Blog-specific (blog pages only)
4. `blog/post/post.css` - Page-specific

**Production features:**
- Can be inlined via `design.inline_css: true` in `site.yaml`
- Automatically optimized/minified

### `.js` and `.ts` - JavaScript/TypeScript

**Loading behavior:**

1. **Root level:** Global scripts on all pages
   - Example: `globals.js`, `app.js`

2. **`@shared/ui/` directory:** UI controllers (auto-loaded globally)
   - Example: `keyboard.js`, `analytics.js`

3. **Application directory:** App-specific scripts
   - Example: `blog/main.js` (blog pages only)

4. **Modules:** Imported via `import_map`

**TypeScript:** Automatically transpiled to JavaScript

**Module Loading:**
- Uses ES modules (`type="module"`)
- Configure imports via `import_map` in `site.yaml`

### `.yaml` - YAML Data Files

**Three types:**

1. **Configuration:** `site.yaml`, `app.yaml`
   - Configuration properties filtered from template data
   
2. **Data files:** Any other `.yaml` file
   - Automatically available as template data
   - Example: `team.yaml`, `authors.yaml`, `navigation.yaml`

3. **Front matter:** In `.md` files
   - Highest priority metadata

**Loading hierarchy:** `@shared/data/` → root → app directory → page

### `.svg` - SVG Graphics

**Default:** Served as static files  
**Templating:** Enable via `svg.process: true` in `app.yaml`
- Process SVG files as Nue templates
- Embed fonts: Configure via `svg.fonts` mapping

### `.json` - JSON Data Files

**Similar to YAML:**
- Automatically merged into template data
- Loaded based on directory hierarchy
- Less common than YAML in Nue projects

---

## Configuration Files

### Configuration vs. Data

**Configuration Properties** (filtered from template data):
- `site`, `design`, `server`, `collections`, `production`, `port`
- `sitemap`, `links`, `include`, `exclude`, `meta`, `content`, `import_map`, `svg`

**Data Properties** (available to templates):
- Any property not in the configuration list
- Custom properties like `site_name`, `company_email`, `team`, etc.
- The `meta` namespace is flattened into template data

### site.yaml Properties

```yaml
# Site-wide behavior (site.yaml only)
site:
  origin: https://example.com       # For sitemap/RSS
  view_transitions: true             # Enable view transitions
  skip: [test/, drafts/]             # Ignore patterns

# Design system (site.yaml only)
design:
  layers: [settings, elements]       # CSS @layer order
  max_class_names: 3                 # Utility class limit
  inline_css: true                   # Inline CSS in production

# Server infrastructure (site.yaml only)
server:
  dir: @shared/server                # Server code directory
  reload: true                       # Auto-reload on changes
  # OR use reverse proxy:
  url: http://localhost:5000         # Backend server
  routes: [/api/, /private/]         # Routes to forward

# Collections (site.yaml, extended by app.yaml)
collections:
  blog:
    include: [posts/]                # Substring match patterns
    require: [date]                  # Required front matter
    tags: [design]                   # Required tags
    skip: [draft]                    # Exclude patterns
    sort: date desc                  # Sort field and direction

# Sitemap (site.yaml only)
sitemap:
  enabled: true                      # Generate sitemap.xml
  skip: [draft, private]             # Skip front matter fields

# RSS feed (site.yaml only)
rss:
  enabled: true                      # Generate /feed.xml
  collection: blog                   # Source collection
  title: Blog Title                  # Feed metadata
  description: Blog description

# Import map (site.yaml, overridden by app.yaml)
import_map:
  app: /@shared/app/index.js
  d3: /lib/d3.js

# Content processing (site.yaml, overridden by app.yaml)
content:
  heading_ids: true                  # Add IDs to headings
  sections: true                     # Auto-wrap in sections
  sections: [hero, features]         # Specific sections
  section_wrapper: wrap              # Wrap with inner div

# Metadata (site.yaml, overridden by app.yaml, front matter)
meta:
  title: Default Title
  title_template: "%s / Site Name"   # %s = page title
  description: Default description
  favicon: /img/logo.svg
  og_image: /img/social.png
  viewport: width=device-width,initial-scale=1
  language: en-US
  author: Default Author
  robots: index, follow
  theme_color: "#0066cc"

# Global links (site.yaml only)
links:
  dev: //github.com/nuejs/nue/tree/dev
  css_vars: //developer.mozilla.org/docs/Web/CSS/var

# Production overrides (site.yaml only)
production:
  title_template: "%s / Production Site"
  analytics_id: GA-PROD-12345
```

### app.yaml Overrides

```yaml
# blog/app.yaml example

# Metadata overrides (nested namespace)
meta:
  title: Blog Title
  author: Blog Author

# Content overrides
content:
  sections: false

# Additional collections
collections:
  featured:
    include: [featured/]
    sort: date desc

# Dependency control
exclude: [marketing-effects]
include: [syntax.css]

# SVG processing (app.yaml only)
svg:
  process: true
  fonts:
    Inter: @shared/design/inter.woff2
```

### Front Matter in .md Files

Uses **flat properties** (highest priority):

```yaml
---
# Overrides meta.title
title: Page Title

# Overrides meta.description  
description: Page description

# Overrides meta.og_image
og_image: /img/page.png

# Custom data
date: 2024-01-15
tags: [web, design]
author: Jane Doe

# Content settings (flat syntax)
sections: [hero, features]
---
```

### Metadata Aliases

Nue recognizes these aliases:
- `desc` → `description`
- `og` → `og_image`
- `date` → `pubDate`

---

## HTML Doctype Conventions

### Doctype Declarations

**Format:** Can use `<!doctype ...>` or abbreviated `<!...>`

**Types:**

1. **`<!doctype html>` or `<!html>`**
   - Server-side HTML page
   - Generates complete HTML document with head, body, meta tags

2. **`<!doctype dhtml>` or `<!dhtml>`**
   - Client-rendered dynamic HTML page
   - Mounts in browser, supports reactivity

3. **`<!html lib>` or `<!doctype html lib>`**
   - Server-side component library
   - Contains reusable components for server rendering

4. **`<!dhtml lib>` or `<!doctype dhtml lib>`**
   - Client-side component library  
   - Interactive components for browser

5. **`<!html+dhtml>` or `<!doctype html+dhtml>`**
   - Isomorphic library
   - Works on both server and client

### Root Element Conventions

**For Pages:**
- **`<body>`** - Single-page application (takes full control)
- **`<main>`** - Content scope for standard pages
- **Custom tag** - Application-specific scope

**For Libraries:**
- Use custom element names or `:is` attribute
- All elements become reusable components

### Special HTML Comments

**Meta comment:**
```html
<!-- @license MIT -->
<!-- @author John Doe -->
```
Parsed as page metadata.

---

## Routing Conventions

### File-Based Routing

**Pattern:** Filenames determine URLs

```
File                      →  URL
──────────────────────────────────────────
index.html                →  /
index.md                  →  /
about.md                  →  /about
blog/index.md             →  /blog/
blog/first-post.md        →  /blog/first-post
contact/thanks.md         →  /contact/thanks
app/index.html            →  /app/ (SPA catchall)
404.md                    →  (error page)
```

### Directory Routing

**Trailing Slash Behavior:**
- Directories without `index.html`/`index.md`: 404
- Requests to `/blog` redirect to `/blog/` if index exists

### SPA Routing

**Single-Page Apps** (`app/index.html` with `<!doctype dhtml>`):
- Handles all routes within directory: `/app/*`
- Use client-side router (e.g., `state` from `nuestate`)
- Include ALL assets from app directory tree automatically

### Server Routes

**Backend API Routes:**
- Defined in `@shared/server/index.js` (or configured directory)
- Use Nueserver API: `get()`, `post()`, `put()`, `del()`, `use()`
- Pattern matching: `/api/users/:id`, `/admin/*`
- Executed on server, never sent to client

### Special Routes

**Automatic routes:**
- `/sitemap.xml` - Generated if `sitemap.enabled: true`
- `/feed.xml` - Generated if `rss.enabled: true`
- `/404` - Custom error page (from `404.md` or `404.html`)

---

## Asset Loading and Dependencies

### Automatic Inclusion Hierarchy

**Load order (lowest to highest precedence):**

1. **`@shared/design/`** - Design system CSS (auto)
2. **`@shared/ui/`** - Global UI components/controllers (auto)
3. **`@shared/data/`** - Global data (server-side, auto)
4. **Root level** - Global assets (`site.yaml`, `global.css`, `app.js`)
5. **Application level** - App-specific assets (`blog/blog.css`, `blog/app.yaml`)
6. **`home/`** - Home page only (for root `index.md` or `index.html`)
7. **Page level** - Same directory as page (`blog/post/styles.css`)

### Asset Types Included

**From dependencies:**
- `.html` - Components and layouts
- `.css` - Stylesheets
- `.js`, `.ts` - Scripts
- `.yaml` - Data and configuration

### Exclusion/Inclusion Patterns

**In site.yaml or app.yaml:**

```yaml
# Exclude assets by name pattern (fuzzy match)
exclude: [marketing-effects, apps.css]

# Re-include specific assets
include: [syntax, calendar]
```

**Pattern matching:**
- Fuzzy substring matching
- `marketing-effects` matches `marketing-effects.html` and `marketing-effects.css`
- `syntax` matches `syntax.css`
- App-level overrides global settings (doesn't extend)

### SPA Asset Inclusion

**Special rule for `app/index.html`:**
- Automatically includes **all assets** from `app/` directory tree
- Ignores `exclude` patterns (unless configured otherwise)
- Ensures all components available

---

## Layout Module Conventions

Nue uses a slot-based layout system where you create modular HTML components that are automatically assembled around your content. Understanding the conventions around layout modules is essential for effective page composition.

### Available Layout Slots

Nue provides predefined slots where layout modules can be placed. Each slot has a specific semantic purpose:

| Slot Name | Purpose | Typical Use Case |
|-----------|---------|------------------|
| `banner` | Temporary announcements | Cookie notices, feature announcements |
| `header` | Global site header | Logo, main navigation, search |
| `subheader` | Secondary navigation | Breadcrumbs, category navigation |
| `main` | Global main wrapper | Rarely used; content typically goes in `article` |
| `aside` | Sidebars | Documentation navigation, category filters |
| `pagehead` | Hero areas | Blog post headers, landing page heroes |
| `pagefoot` | Call-to-action sections | Newsletter signup, related content |
| `beside` | Complementary content | Table of contents, author bio |
| `footer` | Global footer | Copyright, footer navigation, social links |
| `bottom` | Below-footer content | Cookie consent, chat widgets |

### Creating Layout Modules

**Convention for Semantic HTML5 Elements:**

For landmark elements like `<header>`, `<footer>`, `<main>`, and `<aside>`, use the tag name directly:

```html
<!-- Automatically maps to the "header" slot -->
<header>
  <a href="/" class="logo">{ site_name }</a>
  <nav>
    <a href="/docs">Documentation</a>
    <a href="/blog">Blog</a>
  </nav>
</header>

<!-- Automatically maps to the "footer" slot -->
<footer>
  <p>&copy; 2025 { site_name }</p>
  <nav>
    <a href="/privacy">Privacy</a>
    <a href="/terms">Terms</a>
  </nav>
</footer>
```

**Convention for Non-Semantic Slots:**

For slots that don't correspond to HTML5 landmarks, use the `:is` attribute:

```html
<!-- Maps to "banner" slot -->
<div :is="banner">
  <strong>New feature available!</strong>
  <a href="/blog/release/">Learn more</a>
</div>

<!-- Maps to "pagehead" slot -->
<section :is="pagehead">
  <h1>{ title }</h1>
  <p>{ description }</p>
</section>

<!-- Maps to "beside" slot -->
<nav :is="beside">
  <h3>On this page</h3>
  <ul>
    <li :for="heading in headings">
      <a href="#{ heading.id }">{ heading.text }</a>
    </li>
  </ul>
</nav>
```

**Convention for Head Content:**

Add custom head elements with a `<head>` module:

```html
<head>
  <meta http-equiv="Content-Security-Policy" 
    content="default-src 'self';">
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
```

This content is added after Nue's auto-generated head elements.

### Layout Module File Organization

**Multiple modules in one file:**

The most common pattern is to place multiple layout modules in a single file:

```html
<!-- layout.html -->
<!doctype html lib>

<header>
  <!-- header content -->
</header>

<footer>
  <!-- footer content -->
</footer>

<nav :is="aside">
  <!-- sidebar navigation -->
</nav>
```

**Individual module files:**

You can also create separate files for individual modules:

```
@shared/ui/
  header.html    <!-- contains just the header module -->
  footer.html    <!-- contains just the footer module -->
blog/ui/
  sidebar.html   <!-- blog-specific aside module -->
```

**File naming conventions for layout modules:**

- `layout.html` - Standard name for layout modules in any directory
- `site.html` - Alternative name for global layout modules at root
- `header.html`, `footer.html` - Common names for individual module files
- `{page-type}.html` - E.g., `post.html` for blog post-specific layouts

### Layout Module File Locations

**Global layouts (apply to all pages):**
- Root: `layout.html` or `site.html`
- `@shared/ui/*.html` - Any HTML library file

**Application-specific layouts:**
- `blog/layout.html` - Applies to all blog pages
- `blog/ui/*.html` - Blog-specific components
- `docs/layout.html` - Applies to all doc pages

**Page-specific layouts:**
- `blog/post/layout.html` - Applies to pages in `blog/post/` directory
- Same directory as the page being rendered

### Layout Module Override Hierarchy

More specific modules override global ones (this is the key convention):

1. **Global level:** `layout.html` or `site.html` at root
2. **Application level:** `blog/layout.html` overrides global for blog pages
3. **Page level:** `blog/post/layout.html` overrides both for specific pages
4. **Front matter:** Page front matter settings override all layout files

**Example:**

```
layout.html              <!-- defines global header -->
blog/layout.html        <!-- overrides with blog-specific header -->
blog/post/layout.html   <!-- overrides with post-specific header -->
```

For a page at `blog/post/hello.md`:
- Uses header from `blog/post/layout.html` (if it exists)
- Falls back to `blog/layout.html` (if post layout doesn't define header)
- Falls back to root `layout.html` (if blog layout doesn't define header)

### Disabling Layout Modules

**Convention: Use `false` in configuration:**

In `app.yaml` or page front matter:

```yaml
# Disable specific modules
banner: false
aside: false
pagehead: false
```

This prevents those slots from rendering, even if modules are defined for them.

### Layout Module Doctype Convention

**Standard doctype for layout files:**

```html
<!doctype html lib>
<!-- or the abbreviated form: -->
<!html lib>
```

This marks the file as a server-side component library that can be used in page rendering.

For more details on the layout system, see [Layout System documentation](layout-system).

---

## Naming Patterns

### Component Discovery

**Nue discovers components by:**

1. **File location:**
   - `@shared/ui/*.html` - Global
   - `blog/ui/*.html` - Blog-specific
   - `app/components.html` - App-specific

2. **Multiple components per file:**
   - All custom elements in library files become components
   - No naming convention required
   - Use `:is` attribute for naming: `<div :is="my-component">`

### CSS Class Naming

**No enforced conventions**, but:
- Can limit utility classes via `design.max_class_names`
- Encourages semantic class names over utilities
- Use `@layer` directive for cascade control

### File Naming

**Conventions (not enforced):**

- **`layout.html`** - Layout modules
- **`site.html`** - Alternative to `layout.html`
- **`{app-name}.html`** - App-specific components
- **`header.html`**, **`footer.html`** - Common module names
- **`base.css`** - Foundation styles
- **`components.css`** - Component styles

### Component Naming

**In HTML libraries:**

```html
<!-- Named via tag -->
<my-component>
  ...
</my-component>

<!-- Named via :is attribute -->
<form :is="login-form">
  ...
</form>
```

**Convention:** Use kebab-case for custom element names

---

## Data Hierarchy and Precedence

### Data Compilation Order (Low to High Priority)

1. **`@shared/data/*.yaml`** and `.json` files
2. **`@shared/data/*.js`** and `.ts` modifier scripts
3. **Root `site.yaml`** and other root `.yaml` files
4. **App `app.yaml`** and other app directory `.yaml` files
5. **Page front matter** (highest priority)

### Merging Behavior

**Objects:**
- `meta` namespace: Merged, then flattened to template root
- `content` namespace: Merged

**Arrays/Primitives:**
- Replaced (not merged)
- Example: `team` array in app.yaml replaces root `team`

**Flattening:**
- Front matter properties flatten over nested config
- `title` in front matter overrides `meta.title` in `site.yaml`

### Content Collections

**Data from collections:**
- Defined in `site.yaml` `collections` object
- Collection name becomes template variable
- Example: `blog` collection → `{{ blog }}` in templates

**Collection properties:**
- `include` - File patterns to include
- `require` - Required front matter fields
- `tags` - Required tags in front matter
- `skip` - Exclude if field exists
- `sort` - Sort by field and direction (`date desc`)

---

## Reserved Property Names

### Configuration Properties (Not Available to Templates)

From `site.yaml` and `app.yaml`:
- `site`
- `design`
- `server`
- `collections`
- `production`
- `port`
- `sitemap`
- `links`
- `include`
- `exclude`
- `meta` (flattened into template root)
- `content`
- `import_map`
- `svg`

### Built-in Template Variables

Automatically available in templates:

- **`is_prod`** - Boolean, true in production builds
- **`url`** - Current page URL (e.g., `/blog/post`)
- **`dir`** - Current directory (e.g., `/blog/`)
- **`slug`** - Page slug (e.g., `post`)
- **`headings`** - Array of heading objects (`{ id, text, level }`)
- **`markdown()`** - Function to render Markdown to HTML
- **Collections** - Variables named after collections (e.g., `blog`)

### Front Matter Reserved Fields

These have special meaning:

- **`title`** - Page title (merged into meta)
- **`description`** - Meta description
- **`date`** - Publish date (also `pubDate`)
- **`author`** - Author name
- **`tags`** - Array of tags (for collections)
- **`draft`** - Skip in collections if true
- **`noindex`** - Skip in sitemap/collections
- **`og_image`** (or `og`) - Social media image

---

## Quick Reference Tables

### Directory Purpose Quick Reference

| Directory | Auto-Included | Purpose |
|-----------|---------------|---------|
| `@shared/design/` | ✅ Yes | Design system CSS |
| `@shared/ui/` | ✅ Yes | Global UI components/controllers |
| `@shared/data/` | ✅ Yes (server) | Global data files |
| `@shared/lib/` | ❌ No | Third-party libraries (import map) |
| `@shared/app/` | ❌ No | Business logic (import map) |
| `@shared/server/` | ❌ No | Backend API routes |
| `@shared/test/` | ❌ No | Test files (ignored) |
| `home/` | ⚡ Conditional | Root `index.md` or `index.html` only |
| `{app}/ui/` | ⚡ Conditional | App-specific components |

### File Extension Quick Reference

| Extension | Purpose | Build Output |
|-----------|---------|--------------|
| `.html` | Pages, components, layouts | `.html` or `.html.js` (dhtml) |
| `.md` | Content (Nuemark) | `.html` |
| `.css` | Stylesheets | `.css` (minified in prod) |
| `.js` | JavaScript modules | `.js` (minified in prod) |
| `.ts` | TypeScript | `.js` (transpiled) |
| `.yaml` | Config/data | Data only, not output |
| `.json` | Data | Data only, not output |
| `.svg` | Graphics | `.svg` (optionally templated) |

### Doctype Quick Reference

| Doctype | Render | Use Case |
|---------|--------|----------|
| `<!html>` | Server | Static pages |
| `<!dhtml>` | Client | Interactive pages |
| `<!html lib>` | Server | Component library |
| `<!dhtml lib>` | Client | Interactive components |
| `<!html+dhtml>` | Both | Isomorphic components |
| (none) | Auto-detect | Determined by content |

---

## Tips for Development by Discovery

### Starting a New Project

1. **Check for `site.yaml`** first - all global configuration
2. **Look in `@shared/`** for system-level assets
3. **Check application directories** for app-specific behavior
4. **Inspect `app.yaml`** files for directory overrides

### Finding Where Assets Load

1. **Global on all pages:** Root level or `@shared/design/`, `@shared/ui/`
2. **App-specific:** In app directory or `{app}/ui/`
3. **Page-specific:** Same directory as the page
4. **Home only:** `home/` directory

### Understanding a Component

1. **Check doctype** - determines server vs. client rendering
2. **Look for `:is` attribute** - defines component name
3. **Search in order:** `@shared/ui/` → `{app}/ui/` → same directory

### Debugging Configuration

1. **Check `site.yaml`** for globals
2. **Check `app.yaml`** in directory for overrides
3. **Check front matter** in `.md` file for page-level
4. **Remember:** Front matter > app.yaml > site.yaml

---

## See Also

- [Project Structure](https://nuejs.org/docs/project-structure) - How to organize your files
- [Configuration](https://nuejs.org/docs/configuration) - Detailed configuration options
- [Page Dependencies](https://nuejs.org/docs/page-dependencies) - Asset loading rules
- [HTML File Types](https://nuejs.org/docs/html-file-types) - Doctype reference
- [Template Data](https://nuejs.org/docs/template-data) - Data hierarchy and precedence
- [Layout System](https://nuejs.org/docs/layout-system) - Headers, footers, navigation, sidebars, etc. across pages

---

## Revision History

| Date | Changes | Revision/Prompt |
|------|---------|---------------|
| 2025-12-15 | Added detailed Layout Module Conventions section covering slots, naming patterns, and override hierarchy | "*Can you expand the conventions-reference.md file on the subject of conventions in layout modules? I see there's some information now (e.g. headers and footers), but there's no information on aside, pagehead, etc. The primary source for this is the layout-system.md file. Make sure to include (or reference) information on which layout modules can be created in their own files versus in layout.html.*" |
| 2025-12-15 | Initial version created with comprehensive conventions documentation | Analyzed Nue documentation and source code to create centralized conventions reference based on "Development by Discovery" philosophy. The following prompt to VS Code's Github Codepilot plugin in Agent mode using Claude Sonnet 4.5 as the LLM was used: "*I would like you to perform a full analysis of Nue (documentation and source), and create a new documentation page (markdown document) named "conventions-reference.md". This page should document all conventions used by Nue and help the developer discovering these conventions. See the attached "development-by-discovery.md" document for background, particularly pay attention to the last section under "A Missing Pattern"*." |

**Note for Editors:** The revisions/prompts listed above can be used with AI coding assistants to recreate or extend this documentation. When updating this file, please add your prompt to help future maintainers understand the methodology. Please order the table by newest revision on top.
