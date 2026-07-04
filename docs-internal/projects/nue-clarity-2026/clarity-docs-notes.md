# Clarity Docs Notes

*The purpose of this document is to capture all kinds of information which we think should go into the new documentation sub-site. These will often be info that is not already on the docs site, info that is incorrect on the old site, meta-info to take advantage of (e.g. how to utilize AI for search), etc.*

## Introduction

We will have sections in this document according to the starting point for our documentation, the [Diátaxis framework](https://diataxis.fr), and we will have sections with information which later will need to find its place in one or more of the Diátaxis sections.

### Diátaxis Sections

- Tutorials
- How-to Guides
- Reference
- Explanation


## Tutorials


## How-to Guides

### How to Scope Assets in a Nue Site

The central mechanism is *automatic dependency inclusion*: Nue determines which CSS, JS, and HTML component files belong to each page based on **folder location**, and links them in the page `<head>` automatically. You don't declare per-page imports; you express intent through where you place a file.

#### Make a CSS or JS file load on every page

Place it in `@shared/design/` (CSS focus) or `@shared/ui/` (component/script focus). Both are auto-included site-wide. Alternatively, a file placed directly at the site root (not in any subfolder) is also globally auto-loaded.

> Note: `@shared/design/` and `@shared/ui/` include all their subdirectories, so `@shared/design/font/` is also auto-included.

#### Make an HTML component available everywhere

Place the `.html` file in `@shared/ui/`. Any file there whose content is only custom elements (or that declares `<!html lib>`) is treated as a component library and is available to every page on the site.

#### Scope assets to a specific section (app)

Place them in the app's folder directly (e.g., `docs/style.css`) or in the app's `ui/` subfolder (e.g., `docs/ui/sidebar.html`). Both are auto-included for every page within the `docs/` hierarchy, but invisible to the rest of the site.

If a section has nested sub-folders (e.g., `docs/guides/`), pages in those sub-folders also pick up files from `docs/` and `docs/ui/`, in addition to their own folder.

#### Scope assets to the home page only

Place them directly in `home/` (e.g., `home/hero.css`). Files directly inside `home/` — but **not** its subfolders — are auto-loaded only for the root `index.md`/`index.html`. No other page picks them up.

The `home/app.yaml` file is also special: its config (including `include:`, `exclude:`, and template data) applies to `index.md` at root, even though that file lives outside `home/`.

> If you have component subfolders (e.g. `home/hero/`), those are not auto-included. They would need an explicit `include:` in `home/app.yaml`.

#### Load shared assets only in specific sections (opt-in)

Place the files in `@shared/lib/` (or any non-auto-included location) and add an `include:` list to the relevant `app.yaml`. The patterns are simple substrings matched against file paths, so `include: [syntax]` pulls in any path containing `"syntax"` across the whole site.

```yaml
# docs/app.yaml
include: [syntax]
```

This is how `@shared/lib/syntax.css` is loaded only in `docs/` and `home/`, not globally. The name `lib` has no special meaning in Nue itself — it's a project-level convention.

#### Add global template data (available to all pages)

Place `.yaml` or `.json` files in `@shared/data/`. For programmatic data transforms (e.g. computing derived values), place a `.js` file in `@shared/data/` that exports a `default` function — Nue calls it after all static data is merged.

#### Separate site configuration from site content

Keep `site.yaml` focused on behavior that Nue itself needs to configure the build, dev server, asset processing, collections, RSS, sitemap generation, and similar framework-level features. Move website copy, social links, CTA text, layout labels, and reusable document metadata defaults into data files such as `@shared/data/content.yaml`.

This is currently best understood as a Nue best practice rather than a strict framework requirement: `site.yaml` can still provide template data, but separating content from configuration makes the site easier to reason about and lets `site.yaml` stay close to its role as the site configuration entry point.

Example split:

```yaml
# site.yaml
site:
  origin: https://nuejs.org
  view_transitions: true

content:
  sections: true

sitemap:
  enabled: true

# Current limitation: RSS feed metadata is partly content,
# but must stay here because Nue reads rss from config.
rss:
  title: Nue developer blog
  description: The UNIX of the Web
  collection: blog
  enabled: true
```

```yaml
# @shared/data/content.yaml
meta:
  title: The UNIX of the Web
  title_template: %s / Nue
  description: Nue is the fastest way to build modern websites
  favicon: /img/favicon.svg
  origin: https://nuejs.org
  og: /img/og.png

tagline: The UNIX of the Web
```

Note that `@shared/ui/content.yaml` is not a shared data file. YAML/JSON files intended as global template data belong in `@shared/data/`.

Current limitation: the `rss:` group is mixed. `rss.enabled` and `rss.collection` are configuration, while `rss.title` and `rss.description` are content. However, Nue currently reads all RSS feed settings from the configuration object, so the whole `rss:` group must remain in `site.yaml` for now.

#### Add app-scoped template data

Place `.yaml` or `.json` files in the app's folder (e.g., `docs/toc.yaml`). They are automatically loaded as template data for pages in that app. Only `app.yaml` can also provide *configuration* at app scope; other YAML/JSON files provide data only.

#### Keep server-side code out of the build

Place it in `@shared/server/` (configurable in `site.yaml` as `server.dir`). That folder is added to the ignore list and never processed or served by the build pipeline. `@shared/server/index.js` is the entry point.


### How to Create and Use Page Collections

Working feature name for new docs: **page collections**. This is more specific than "collections" or "content collections" because the feature turns a set of source pages into a template array. Current source builds these arrays from Markdown pages only, so reference docs should say "Markdown pages" when describing exact behavior.

Recommended how-to shape: keep creation and usage together as one workflow, because the feature is easiest to understand when users see the full path from files to rendered list.

1. Put related Markdown pages in a folder, such as `blog/` or `posts/`.
2. Add front matter for properties you want to list, sort, or filter by, such as `date`, `author`, `tags`, or `draft`. Note that Nuemark can also infer `title` from the first `h1` and `description` from the first content paragraph when those properties are missing from front matter.
3. Define the collection in `site.yaml` under `collections:`.
4. Render the generated array in an HTML component or page template using the collection name as a context property.
5. Optionally filter with `require`, `tags`, and `skip`, sort with `sort`, or point RSS at the collection with `rss.collection`.

Example:

```yaml
# site.yaml
collections:
  blog:
    include: [blog/]
    require: [date]
    skip: [draft, noindex]
    sort: date desc
```

```html
<div :is="blog-entries">
  <article :each="post in blog">
    <h2><a href="{ post.url }">{ post.title }</a></h2>
    <time>{ post.date }</time>
    <p>{ post.description }</p>
  </article>
</div>
```

Important author-facing explanation: `collections.blog` in `site.yaml` does not expose `{ collections.blog }` in templates. The generated collection is exposed directly as `{ blog }`.


## Reference

### Page Collections

A page collection is a named array of Markdown pages that Nue builds from the site file tree and makes available as a template context property. Page collections are for pages-as-data: blog posts, docs pages, changelog entries, case studies, release notes, or any other group of Markdown pages that should be listed, sorted, filtered, rendered as previews, or used as an RSS source.

Current source behavior:

1. Collection definitions are read from `conf.collections`.
2. `asset.data()` builds collection arrays from `files.filter(f => f.is_md)`, so only Markdown assets are included. HTML pages are not currently collection items.
3. For each collection, Nue matches each Markdown asset path against the collection's `include:` strings.
4. `include:` values are plain substring matches against the full relative path. They are not globs.
5. Matching Markdown pages are parsed with Nuemark.
6. Parsed pages can be filtered with `require`, `tags`, and `skip`.
7. Each retained page becomes a collection item shaped as `{ ...meta, url, dir, slug }`.
8. Items are sorted if `sort:` is present.
9. The resulting array is assigned to render data under the collection name.

Supported collection options in current source:

| Option | Current behavior |
|---|---|
| `include` | Array of path substrings. A page is included when its relative Markdown file path contains one of the strings. |
| `require` | Array of metadata property names. A page is kept only when all listed properties are truthy on parsed `meta`. |
| `tags` | Array of tag names. A page is kept when `meta.tags` includes at least one listed tag. |
| `skip` | Array of metadata property names. A page is removed when any listed property is truthy on parsed `meta`. |
| `sort` | String in the form `field` or `field direction`; direction defaults to `asc`, and `desc` reverses the comparison. |

Collection item properties:

```js
{
  ...meta,
  url,
  dir,
  slug
}
```

`meta` is the parsed Nuemark metadata. It includes front matter properties, and Nuemark currently fills in missing `title` from the first `h1` and missing `description` from the first content paragraph. `url`, `dir`, and `slug` come from the source file path.

Sorting is a simple JavaScript comparison of the selected property values. Dates should be stored in a consistently sortable form, such as ISO-like date strings, unless YAML parsing turns them into `Date` objects in the relevant path.

RSS generation uses the same collection machinery. `rss.collection` names the collection to use as feed items, and the named collection must also exist under `collections:`.

#### Current Docs Mismatches to Fix

- `website-development.md` currently shows `match: [posts/*.md]`, but source uses `include: [posts/]`.
- The current docs examples imply glob matching (`posts/*.md`, `docs/**/*.md`). Source uses simple substring matching via `path.includes(pattern)`. There is no glob syntax in collection matching today.
- Some docs say `app.yaml` can extend `collections:`. Current source treats `collections` as site configuration and does not merge app-level `collections` through `mergeConf`, so public docs should describe page collections as `site.yaml` configuration unless the implementation changes.
- "Collections automatically gather matching files" should say Markdown pages, not generic files.
- "Content collections" in `template-data.md` currently implies collection item generated properties include more than source adds. Source collection items are `{ ...meta, url, dir, slug }`; `is_prod` is page render context, not a collection item property.
- "Metadata from front matter" is incomplete for `title` and `description`: Nuemark can infer those into parsed `meta` from page structure.
- Current docs blur three mechanisms that should be separated in the new docs: YAML/JSON template data, page front matter/page metadata, and generated page collection arrays.
- The `team` example in `website-development.md` can confuse page collections with plain YAML data because the later content-first workflow uses `team.yaml` as structural data. A team can be modeled either way, but those are different mechanisms.

#### Information Architecture for New Docs

Use **Page collections** as the main feature section name. The YAML key remains `collections:` for compatibility, but the prose should introduce the feature as page collections.

Recommended docs shape:

- Reference: `Page collections` — exact behavior, options, item shape, current Markdown-only scope, RSS relationship, and limitations.
- How-to: `How to create and use page collections` — one practical workflow from Markdown files to `site.yaml` config to rendered list. Keep creation and utilization together unless the material grows enough to split later.
- Explanation: a short conceptual note that page collections are generated template data, not hand-authored YAML/JSON data and not generic file dependency inclusion.

### Folder Reference

#### `@shared/` — the shared root

Can only exist at the site root. Its subfolders fall into two categories: auto-included and opt-in. All files in `@shared/` are sorted and loaded before any other scope (highest priority in the CSS/JS cascade).

| Subfolder | Auto-included? | What it's for |
|---|---|---|
| `@shared/design/` | **Yes**, all pages | CSS (and technically other asset types, but CSS is the intent). Includes all subdirectories. |
| `@shared/ui/` | **Yes**, all pages | HTML component libraries, CSS, and JS for global layout and UI. Includes all subdirectories. Data files (`.yaml`/`.json`) here are excluded from template data (use `@shared/data/` instead). Also note that this behavior is different from `{app}/ui/` folders where data files are accepted. |
| `@shared/data/` | **Yes** (data only) | `.yaml`/`.json` as global template data. `.js` files with a default-exported function run as data transform/enrichment scripts. Other file types in this folder are never written to `.dist`. |
| `@shared/server/` | **No** — ignored entirely | Server-side code. Entire folder is excluded from fswalk. Configurable via `server.dir` in `site.yaml`. |
| `@shared/test/` | **No** — ignored entirely | Hardcoded-ignored folder. Presumably for test code. |
| `@shared/<anything-else>/` | **No** | Treated as opt-in. Files are built and written to `.dist`, but never auto-linked into any page. Use `include:` in `app.yaml` to pull them in selectively. The names `lib`, `app`, `client-app` etc. are pure conventions with no special framework meaning. |

#### `home/` — the root-page companion folder

Files placed *directly* in `home/` (not in subfolders) are auto-included for `index.md`/`index.html` at the site root. No other page receives them. `home/app.yaml` also applies its config and `include:` patterns to that root page.

This is the only folder in Nue where files are auto-loaded for a page that lives *outside* that folder. No other folder name has this behavior — it is hardcoded for `home/`.

Subdirectories of `home/` (e.g. `home/hero/`) are **not** auto-included. They require explicit `include:` in `home/app.yaml`.

#### `{app}/` — app folders

Any subfolder at root level that is not `@shared/` behaves as an app folder. Its files are auto-included only for pages within that folder hierarchy. Rules:

- Files directly in `{app}/` are included for all pages under `{app}/`.
- Files in `{app}/ui/` are also included for all pages under `{app}/`.
- For nested pages (e.g. `{app}/guides/page.md`), both `{app}/` and `{app}/guides/` (and their `ui/` subfolders) are included.
- Data files (`.yaml`/`.json`) in `{app}/` and `{app}/ui/` are loaded as template data for pages in that app.
- `app.yaml` in `{app}/` (or `{app}/ui/`) provides app-scoped configuration that extends/overrides `site.yaml`.

#### Root level (`.`)

Files placed directly at the root (not in any subfolder) are auto-included for every page on the site, equivalent to global scope. `site.yaml` at root is the only place global configuration is read from.

Root `ui/` has **no special meaning** — it is not equivalent to `@shared/ui/`. For global UI components, use `@shared/ui/`.


### File Type Reference

This describes what Nue does with each file type during a build.

| Extension | Dependency list? | Written to `.dist`? | Purpose |
|---|---|---|---|
| `.css` | Yes (if in scope) | Yes — as-is (dev) or minified (prod) | Linked as `<link rel="stylesheet">` in `<head>` |
| `.js` | Yes (if in scope, and not in `@shared/data`) | Yes — as-is (dev) or minified (prod) | Linked as `<script type="module">` in `<head>` |
| `.ts` | Yes (if in scope) | Yes — always transpiled to `.js` | Linked as `.js` URL in `<head>` |
| `.html` (lib) | Yes (if in scope) | **No** — used only at build time | Component definitions; parsed and injected into page HTML during rendering |
| `.html` (dhtml lib) | Yes (if in scope) | Yes — compiled to `.html.js` | Client-side reactive components |
| `.html` (page) | Yes | Yes — rendered to full HTML | Stand-alone pages |
| `.md` | Yes | Yes — rendered to `.html` | Markdown content pages |
| `.yaml` | Yes (for data only) | **No** — excluded from `.dist` | Template data and configuration; `site.yaml`/`app.yaml` also provide config |
| `.json` | Yes (for data only) | Yes — copied as-is | Template data |
| Everything else (images, fonts, etc.) | No | Yes — copied as-is | Static assets served directly |

**`.html` lib detection:** A `.html` file is treated as a component library if all its top-level elements are custom elements, or if it carries a `<!html lib>` doctype declaration. Otherwise it is treated as a page.

**`.ts` vs `.js`:** TypeScript is always transpiled (both dev and prod). Plain JS is only minified in production; in dev it is copied as-is.

**Files and folders ignored entirely by fswalk:**
- Any file or folder whose name starts with `.` or `_`
- `node_modules/`, `package.json`, `Makefile`, `README.md`, `.lock` files, `.toml` files, `.rs` files
- `@shared/server/` (and whatever `server.dir` is set to in `site.yaml`)
- `@shared/test/`
- Any pattern listed under `site.skip` in `site.yaml`


### Auto-Inclusion Rules (Dependency Resolution)

When rendering a page, Nue resolves its dependency list by walking all site assets and applying these rules in order. The first matching rule wins.

1. **Self** — the page file itself is excluded.
2. **Root files** — any file directly at root (dir `== '.'`) is always included.
3. **Auto-included shared folders** — any file under `@shared/data/`, `@shared/design/`, or `@shared/ui/` (including their subdirectories) is always included.
4. **SPA entries** — if the page is an `index.html` marked as a dynamic SPA, its entire subtree is included.
5. **Root index special case** — for `index.md` or `index.html` at root, files directly in `home/` (not subfolders) are included. This is the only check for root index pages; they do not go through hierarchical inclusion.
6. **Hierarchical inclusion** — for all other pages, a file is included if its directory matches any ancestor directory of the page, or any `ui/` subfolder of an ancestor directory.

Files that are in scope by the above rules can still be further filtered using `exclude:` in `app.yaml`. Files outside scope can be pulled in using `include:`.


### The `include:` and `exclude:` Mechanism

Both are lists of plain strings defined in `site.yaml` or `app.yaml`. Each string is matched as a **substring** against the full relative path of every file in the site. There is no glob syntax — `assembly` matches `@shared/lib/assembly/assembly.html`, `@shared/lib/assembly/assembly.css`, and any other path containing that string.

```yaml
# home/app.yaml
include: [assembly, console, hero, stack, syntax]
```

Automatic dependency resolution first considers only dependency-capable files: `.html`, `.js`, `.ts`, `.yaml`, `.json`, and `.css`. `exclude:` then removes any matching paths from that list. Finally, `include:` searches all walked site files and adds every matching path back to the dependency list. Because `include:` runs after `exclude:`, it wins if a path matches both.

In practice, `include:` is mainly for pulling in component libraries, scripts, stylesheets, and data files from folders that are not auto-included, such as `@shared/lib/`. The matched file type still determines what Nue can do with it: CSS is linked in the page head, JS/TS is linked as module scripts, HTML libraries are available to the renderer, and YAML/JSON can provide data. Other static assets may still be built and served normally, but adding an image or font to the page dependency list does not by itself create a `<link>`, `<script>`, or markup reference to that asset.

If an `include:` string matches a folder name, every walked file whose path contains that folder segment is added. For example, `include: [console]` can match `@shared/lib/console/console.html`, `@shared/lib/console/console.css`, and `@shared/lib/console/console.js` together.

> Warning: Keep `include:` strings narrow, especially in `site.yaml`. A loose global pattern can expose assets to every page. For example, `include: [console]` in `site.yaml` does not mean "the shared console component"; it means "every walked path containing `console`". If the only match is `admin/console/`, those files become global page dependencies. Prefer a more specific path fragment such as `@shared/lib/console/` or `/lib/console/` when the intent is a particular shared folder.

`site.yaml` provides the site-wide default. An app-level `app.yaml` can replace that default with its own `include:` or `exclude:` list. The `app.yaml` whose `include:`/`exclude:` applies is determined by which `app.yaml` files are in the page's natural dependency list — so `home/app.yaml` applies to `index.md` (because `home/` files are in its natural deps), and `docs/app.yaml` applies to pages in `docs/`.


### Load Order (CSS Cascade Priority)

When multiple CSS files are linked in a page, they are sorted by origin scope, broad to narrow:

1. `@shared/` files (all subfolders) — lowest specificity, load first
2. Root-level files (`.`)
3. App/page-level files — highest specificity, load last

Within each scope, files sort by directory depth (shallower first), then by discovery order. This means `@shared/design/base.css` always precedes `docs/style.css`, which ensures the design layer can be safely overridden at the app level.


### Configuration vs Template Data

Nue currently has two overlapping concepts in YAML files:

- **Configuration** controls framework behavior: site origin for sitemap/RSS, view transitions, design layers, collections, content processing, server settings, resource settings, platform settings, `include:`, and `exclude:`.
- **Template data** is merged into the data object available to Nuemark pages and Nue HTML templates: layout copy, social URLs, CTA text, navigation data, document metadata defaults, feature lists, and other content/data used during rendering.

`site.yaml` is special because it is the only root-level file read as global site configuration. It can also contribute template data, but known configuration groups are skipped from the template data object. Other YAML/JSON files generally provide data only, except `app.yaml`, which can provide app-scoped configuration as well as data.

Template data precedence, lowest to highest:

1. Shared data from `@shared/data/*.yaml` and `@shared/data/*.json`
2. Root-level data, including `site.yaml` data that is not treated as configuration
3. App-level data from relevant app folders and `app.yaml` files
4. Page front matter

Configuration and data are merged differently. Configuration groups such as `site`, `design`, `collections`, `sitemap`, and `rss` remain grouped on the config object. Keys under `meta:` are flattened into the render data object, so the `meta.title` data path becomes available as the `{ title }` context property, not `{ meta.title }`.

Some configuration groups contain child keys that are conceptually content. The current `rss:` group is the clearest example: `enabled` and `collection` control behavior, while `title` and `description` are feed content. In the current implementation, RSS generation reads `title`, `description`, `collection`, and `enabled` from `conf.rss`, so even the content-like RSS keys need to remain in `site.yaml`. Moving them to `@shared/data/content.yaml` would not feed RSS generation.


### The `meta:` Group

`meta:` is best described as a group of document/page metadata defaults, not as "every child becomes an HTML `<meta>` element". Nue flattens keys under `meta:` into page data before rendering. The head renderer then uses selected well-known context properties to produce `<title>`, `<link>`, and `<meta>` elements.

Example:

```yaml
meta:
  title: The UNIX of the Web
  title_template: %s / Nue
  description: Nue is the fastest way to build modern websites
  favicon: /img/favicon.svg
  origin: https://nuejs.org
  og: /img/og.png
```

After flattening, templates and renderers access these as context properties: `{ title }`, `{ description }`, `{ favicon }`, `{ origin }`, and `{ og }`.

Current well-known `meta:` properties from the Nue website:

| Property | Source-known? | Current behavior |
|---|---|---|
| `title` | Yes | Used for the document `<title>` and derived `og:title`. Also common in page front matter and collections. |
| `title_template` | Yes | Formats the document `<title>` and derived `og:title`; `%s` is replaced by the page title. |
| `description` | Yes | Used for `<meta name="description">` and derived `og:description`. `desc` is also recognized as an alias. |
| `favicon` | Yes | Used for `<link rel="icon" href="...">`. |
| `og` | Yes | Alias/input for `og:image`. `og_image` is also recognized. |
| `origin` | Yes, as render data | Used by `og:image` generation in production to turn root-relative image paths into absolute URLs. It is not used for sitemap/RSS. |

Other known metadata-style keys in Nue include `viewport`, `author`, `robots`, `date`/`pubDate`, `language`, `direction`, and `class`. Some become `<meta>` elements; others affect wrapper attributes such as `<html lang="...">`, `<html dir="...">`, or `<body class="...">`.

Important distinction:

- `site.origin` is framework configuration used by sitemap and RSS generation.
- `meta.origin` is flattened render data used by Open Graph image generation.

In the current implementation, a site that wants correct sitemap/RSS URLs and absolute production `og:image` URLs needs both values, even if they are identical.

#### Dev vs production rendering

Most `meta:`-fed head values render the same in dev and production. For example, `title`, `title_template`, `description`, `favicon`, `author`, `robots`, `viewport`, and `theme-color` are not inherently mode-dependent in the head renderer.

The main current exception is Open Graph image URL rendering:

```yaml
meta:
  origin: https://nuejs.org
  og: /img/og.png
```

In dev mode, Nue renders the image path without `origin`:

```html
<meta name="og:image" content="/img/og.png">
```

In production mode, Nue prefixes the image path with `meta.origin`:

```html
<meta name="og:image" content="https://nuejs.org/img/og.png">
```

This means a localhost browser inspection can make `meta.origin` look unused even when the data is loading correctly. Validate absolute Open Graph image URLs with a production render/build, not with the dev server alone.

Related but separate: `production:` in `site.yaml` can override values under `meta:` during production configuration creation. That is a configuration-level production override, not a special rendering rule for individual `meta:` keys.


### Website-Only Template Data

Some values are not well-known to Nue source code at all. They are simply project/template data referenced by the website's own components and layouts.

Examples from the Nue website:

| Property | Used by |
|---|---|
| `tagline` | Footer/layout copy such as `{ tagline }`. |
| `gh` | Website header GitHub link/count data. |
| `slack` | Website header Slack link data. |
| `teaser` | Optional header CTA data. |
| `join` | Optional mailing list CTA/form data. |

These values are good candidates for `@shared/data/content.yaml` or another descriptive data file rather than `site.yaml`, because they are content and presentation data, not framework configuration.


## Explanation




***
*General information is placed below*

## Meta (not about documentation itself, but how to do the sub-site)

### Nue Common Vocabulary

We need a common vocabulary for Nue so that new docs, contributor discussions, and future AI-assisted work use the same terms consistently. The current working source is [Nue Vocabulary](nue-vocabulary.md), which broadens the earlier [Nue Template Terminology](template-terminology-notion.md) notes from template-only terminology to full Nue scope.

Current direction:

- Use *property* as the general data term in Nue.
- Use *key* when discussing YAML, JSON, or JavaScript object source syntax.
- Use *attribute* for markup syntax written on HTML or Markdown tags.
- Use *directive* for colon-prefixed Nue syntax such as `:if`, `:each`, `:is`, and `:bind`.
- Use *context property* for any named value available during template rendering.
- Use *data path* for dotted references to nested source/data structure, such as `meta.title` or `site.origin`.
- Avoid *namespace* as official terminology for YAML/data grouping; prefer *group*, *mapping*, or *data path* depending on context.

This vocabulary should guide M5 information architecture and later public docs, but does not necessarily need to appear as a standalone public page. The likely public-docs pattern is short inline definitions where a term first matters, with the internal vocabulary serving as the consistency source.

### Search

The https://sequinstream.com/docs/quickstart/webhooks site shows how you can utilize external AI chatbots for searching your site. For instance when you click on "Open in ChatGPT" it will open ChatGPT in a new window and prefil the chat box with "Read from https://nuejs.org/docs/ so that I can ask you questions about it".

### Making the site AI friendly

One way is to make any page available as downloadable markdown. The https://sequinstream.com/docs site has this feature as part of the "Open in ChatGPT" dropdown where one of the dropdown items is "Copy page" with tip "Copy page as Markdown for LLMs". It then copies the markdown to the clipboard. I notice the markdown did contain html sections and that might be something we'd end up with as well if our markdown uses html components.

### Client-side Components

I'm not sure how well any of the old documentation or my [SPA research](../../spa-research.md) documents this, but in Nue it's possible to mount client-side components on a static page. In other words, the majority of the page is static HTML, optionally built from a markdown file, and then one section within the page is mounted and rendered on the client. As a good example of this, see the Nue website itself. Its home page has a "Console" HTML Component referenced like this:

```markdown
[console]
Nue is small and fast
```

The Console component is its own HTML-file with the following declaration:

```HTML
<!dhtml lib>
```

When building the site, instead of the component being added to the static HTML, a console.html.js file is rendered. This .js file is mounted on the client and the DOM is updated with the contents. Also see the "join-list" client-side component there.

This whole concept is a great feature, and we must make sure it's well documented along with the full SPA feature set (the SPA term is misleading, sounds like a "big" thing).

### Nue Best Practices

#### Separate configuration from content in YAML files

Use `site.yaml` for framework configuration and use data files for site content. This is a project-level best practice being introduced for the Clarity docs work; it is not yet a hard framework distinction.

Recommended model:

- Keep `site.yaml` for build/runtime behavior: `site`, `design`, `content`, `collections`, `sitemap`, `rss`, `server`, `resources`, `platform`, `include`, and `exclude`.
- Move reusable content and template data to `@shared/data/*.yaml`: taglines, social links, CTA text, global labels, page metadata defaults, feature lists, and similar values.
- Keep mixed implementation-driven groups in `site.yaml` when Nue currently reads them from configuration. For example, `rss.title` and `rss.description` are content, but must stay under `rss:` in `site.yaml` until RSS generation can read feed metadata from template data.
- Keep the `meta:` group if it helps document that values are document/page metadata defaults, but remember that Nue flattens keys under `meta:` into render data.
- Keep website-only content out of `meta:`. For example, `tagline` is template copy, not document metadata.
- Do not place global content data in `@shared/ui/`; that folder is for globally available UI assets. Use `@shared/data/` for shared data.

The open information-architecture question for M5: decide whether this should become a formal Reference topic, a How-to guide, or a Best Practices page. The likely shape is all three: a reference page for exact YAML/data behavior, a short how-to for moving content out of `site.yaml`, and a best-practice note explaining why the separation matters.
