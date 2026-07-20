# Clarity Docs Notes

*The purpose of this document is to capture all kinds of information which we think should go into the new documentation sub-site. This will often be info that is not already on the docs site, info that is incorrect on the old site, meta-info to take advantage of (e.g. how to utilize AI for search), etc.*

## Introduction

We will have sections in this document according to the starting point for our documentation, the [Diátaxis framework](https://diataxis.fr), and we will have sections with information which later will need to find its place in one or more of the Diátaxis sections.

### Diátaxis Sections

- Tutorials
- How-to Guides
- Reference
- Explanation


## Tutorials
*These are just some ideas for tutorials; needs to be evaluated (and expanded?).*

- Creating a Nue project from scratch (should be a regular MPA, SSG site)
- Creating an SPA app
- Creating an MPA/SPA hybrid site
- Creating a blog site
- Creating a documentation site
- Deploying a Nue project to CloudFlare (with Wranger, with Git integration)

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


### How to Control Nuemark Structure for CSS

Current public docs need a clearer path from Nuemark source to the rendered HTML that CSS authors actually target. The practical author-facing model is:

1. Use `content.heading_ids` and `content.sections` for page-wide document structure.
2. Use heading attributes for stable heading selectors.
3. Use anonymous blocks and tags for local layout hooks.
4. Use HTML pages or custom components when Markdown-native structure is not precise enough.

Global or app-level defaults go under `content:`:

```yaml
# site.yaml or app.yaml
content:
  heading_ids: true
  sections: true
```

Page-level settings use flat front matter:

```md
---
heading_ids: true
sections: [hero, features, details]
---
```

`sections: [hero, features, details]` turns on section rendering and assigns class names by section index. Nuemark first computes the section boundaries, then applies the array values to the generated sections in order:

```html
<section class="hero">...</section>
<section class="features">...</section>
<section class="details">...</section>
```

It does not apply all classes to every section, and it does not map class names to heading levels. If the first generated section starts with an `h1`, it gets `hero`; if the second generated section starts with an `h2`, it gets `features`; if a later `h3` stays inside that second section, it does not receive its own section class. If there are more sections than class names, later sections have no class. If there are more class names than sections, the extra class names are unused. Avoid examples with duplicate YAML keys such as:

```yaml
content:
  sections: true
  sections: [hero, features]
```

Use one `sections:` value or the other.

When sectioning is on, `---` changes sectioning from heading-driven to author-driven. If no `---` exists, section boundaries come from the heading rules. If any `---` exists, section boundaries come from the separators instead, and headings no longer start sections. In that mode `---` is structural and disappears from rendered output; it is not rendered as `<hr>`.

Use `---` when headings do not express the section boundaries you want. For example, it can keep an `h1` and a following `h2` inside the same first section:

```md
---
sections: [hero, details]
---

# Nue Features
Intro copy.

## Why it matters
Still part of the hero section.

---

## Details
Now the second section starts.
```

There is no current option to leave an `h1` in the Markdown body unwrapped and start section wrappers at the first `h2`. With section rendering enabled, all rendered Markdown content is inside generated `<section>` elements. The practical workaround is to put the `h1` in a layout slot such as `pagehead`, derive it from front matter, and let the sectionized Markdown body start with `h2`.

Current implementation caveat: page front matter cannot reliably disable inherited `heading_ids` or `sections` with `false`, because Nuekit currently resolves them with truthy fallback. App-level `content.sections: false` can override site config through config merge, but page front matter `sections: false` falls back to inherited config. This is visible in `packages/nuekit/src/render/page.js`, and the current `packages/www/docs/index.md` tries `heading_ids: false` while the generated page still has heading IDs.

Heading attributes give CSS/linking hooks on headings:

```md
## Installation { #install.tight }
```

Renders:

```html
<h2 id="install" class="tight">Installation</h2>
```

Only `id` and `class` are supported in the `{ ... }` heading attribute syntax. Generated heading IDs are simple slugs and are not deduplicated, so repeated headings can produce repeated IDs.

Anonymous blocks create local wrapper elements:

```md
[.note]
  ## Note
  Content here.
```

This renders a `<div class="note">`, not a `<section>`. If the block content splits into multiple internal sections, Nuemark wraps each internal group in a child `<div>`:

```md
[.features]
  ### First
  Text

  ### Second
  Text
```

Manual separators with `---` can also split block content into child divs. Use this when CSS needs predictable children without authoring raw HTML in Markdown.

Square-bracket tag shorthand supports classes and IDs on built-in tags and custom components:

```md
[image#hero.responsive hero.jpg]
[accordion.faq name="docs" open]
[table.compact :rows="pricing"]
```

Important distinction: only a small allowlist becomes real HTML attributes in Nuemark tag syntax: `id`, `is`, `class`, `style`, `hidden`, `disabled`, `popovertarget`, `popover`, and `data-*`. Other named options become tag/component data. For example, `loading="eager"` is data consumed by `[image]`, while `data-state="open"` becomes a real HTML attribute.

Custom Markdown tags are square-bracket calls to components defined in HTML libraries. For example, if a site defines a `card` component, Markdown can call it with `[card]`. Nuekit passes parsed tag data, shorthand classes/IDs, and nested Markdown slot content to the component, but the component decides which attributes appear in final HTML. To make classes pass through, the component needs to use them explicitly:

```html
<div :is="card" class="card { class } { type }">
  <slot/>
</div>
```

Prefer inline tag options when a custom component needs both data and slot Markdown:

```md
[card type="feature" title="Key Feature" footer="Learn more"]
  This is Markdown slot content.
```

Do not document this pattern as if it produced both data and slot content:

```md
[card]
  title: Key Feature
  footer: Learn more

  This prose is not parsed as slot Markdown in the current parser.
```

Once a tag body is recognized as YAML data, Nuemark does not also parse that body as Markdown blocks.

Raw HTML in `.md` is not a general escape hatch today. The block parser skips lines that start with `<`, so manual `<div>` or `<section>` markup in Markdown does not reliably render as HTML. Use an `.html` page/layout/component for arbitrary HTML structure, or expose the structure through a custom component.

### FAQ
*For instance:*

- What’s the syntax used inside template expressions (`{ expr }`)?
- What's the difference between using single and double braces for template expressions?
- How do I render HTML using markdown template data?
- How do I pass data into HTML components?
- What kind of HTML rendering does Nue 2.0 provide (SSG/SSR/CSR)? (Note: this is not a "How-to" topic)
- What external dependencies does Nue 2.0 have? (Note: this is not a "How-to" topic)


## Reference

### View Transitions

`site.view_transitions: true` adds Nuekit's `@nue/transitions.js` client runtime to every rendered page. It is not only a CSS animation switch: the runtime turns eligible same-site link clicks into fetch-and-patch navigation. It fetches the destination HTML, parses it in memory, updates selected parts of the current document inside `document.startViewTransition()`, and uses the History API instead of loading a new browser document.

Current runtime behavior and consequences:

- **No new document on intercepted navigation.** `DOMContentLoaded`, `load`, and module top-level evaluation happen on the initial load or a manual reload, not on a client-side route change. Page-global JavaScript state remains alive. Code that initializes page behavior in `DOMContentLoaded` needs an additional route-aware path.
- **Nue lifecycle events:** `before:route` fires before the destination fetch. After Nue patches the page, it dispatches `route` and `route:<app>`, where `<app>` is the first URL path segment or `home`. The client-component mount runtime already listens for `route`; new docs should present `route` as the appropriate hook for behavior that must run after every Nue navigation. Event handlers must be idempotent because they can run after both an initial load and later route changes.
- **Only selected document parts are updated.** Nue updates the title, the `libs` metadata entry, external module scripts, stylesheets, inline `<style>` elements, `<main>`, and `<body>` content/class. It does not replace the document itself or generally synchronize the full `<head>`; for example, page-specific ordinary meta tags, favicon links, and existing scripts are not removed/replaced by this runtime. New module URLs are dynamically imported, but browser module caching means a module URL executes only once per page session.
- **DOM identity is conditional.** The runtime recursively keeps elements only while the current and incoming nodes have the same child tag structure; otherwise it replaces HTML or individual elements. Direct listeners and imperative state on retained nodes can survive; listeners/state on replaced nodes do not. Prefer event delegation or a route initializer over assuming a fresh DOM on each page.
- **Interception is intentionally narrow but not fully documented.** It skips modified clicks, `target` links, `mailto:`, URLs containing `//`, direct `#fragment` links, and apparent files with an extension other than `.html`. Forms are not handled. It intercepts other ordinary anchors, including relative paths, then passes `el.pathname` to the router. That discards query strings and fragments for intercepted navigation; direct `#fragment` links retain normal browser behavior. This is a current limitation to verify/fix before presenting it as a polished public feature.
- **History and scrolling change.** Startup uses `history.replaceState()` for the initial page; intercepted forward navigation uses `pushState()`; `popstate` fetches and patches a previous managed page. Scroll positions are kept only in an in-memory map keyed by pathname. New client-side navigation scrolls to the top, and back/forward restores a saved position when available. A history entry with no Nue `path` state is ignored by this handler.
- **It has an in-memory page cache.** Fetched HTML is cached by path for the life of the current document, so revisiting an already visited path does not fetch it again. That supports fast repeat navigation but can show stale page HTML during a long-lived session.
- **Browser support fallback.** When `document.startViewTransition` is unavailable, Nue supplies a callback-only fallback, so fetch-and-patch navigation still occurs but without the browser's visual View Transitions API animation.
- **Failure handling is minimal.** A 404 response whose body is not HTML creates a small in-place "Page not found" article; the runtime has no broader fetch-error/recovery path. This needs separate validation before public documentation promises navigation reliability or error semantics.

Suggested public-docs framing: document the setting as **client-side page navigation with optional native view-transition animation**, rather than merely "transitions between pages." The reference should explicitly distinguish it from the separate full-SPA routing/state system and include the lifecycle contract, history/scroll behavior, current caching behavior, and compatibility fallback.

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

### Nuemark Configuration and Structure Reference

This section records current source behavior for Nuemark features that affect rendered structure and CSS targeting. It is intentionally scoped to configuration, headings, sections, blocks, tags, and attributes.

#### Content configuration

Relevant current settings:

| Setting | Where | Current behavior |
|---|---|---|
| `content.heading_ids` | `site.yaml`, app `app.yaml` | Adds generated IDs and empty anchor links to headings without explicit IDs. |
| `content.sections` | `site.yaml`, app `app.yaml` | Enables section wrapping for Markdown render output. Can be `true`, `false`, or an array of section class names. |
| `heading_ids` | Markdown front matter | Page-level truthy override for heading IDs. Current source cannot use `false` to disable an inherited truthy config. |
| `sections` | Markdown front matter | Page-level truthy override for section wrapping/classes. Current source cannot use `false` to disable an inherited truthy config. |
| `links` | site/app config | Supplies global reference links for Nuemark reference-link syntax. |

`section_wrapper` is currently documented in public docs but not wired. Nuemark has a low-level render option named `content_wrapper`, but Nuekit does not pass `content.section_wrapper`, `section_wrapper`, or `content_wrapper` from config/front matter into `doc.render()`. Current docs showing `section_wrapper: wrap` are inaccurate.

#### Sectioning rules

Nuemark's `sectionize()` is used for page sections, anonymous block internals, accordions, lists, and definitions.

The high-level model is: first Nuemark determines section boundaries, then `sections: [...]` class names are assigned to the resulting sections by index. Heading level influences where sections are cut; it does not determine which class name is used.

Current rules:

1. If any `---` separator exists, section splitting is controlled by `---`, and headings no longer create section boundaries.
2. Only `---` is a section separator. Other thematic breaks like `***`, `___`, and `- - -` render as `<hr>` and do not drive section splitting.
3. If there is no `---`, Nuemark looks for the first heading with level `h1`, `h2`, or `h3`.
4. If the first sectioning heading is `h3`, sections split on `h3`.
5. If the first sectioning heading is `h1` or `h2`, sections split on `h1` and `h2`; `h3` stays inside the current section.
6. `h4` and deeper do not start sections.
7. In page rendering with `sections` enabled, content with no sectioning heading/separator still gets wrapped as one `<section>`.

When section rendering is enabled, `---` separators are omitted from output because they are structural. When section rendering is not enabled, `---` renders as `<hr>`.

This makes `---` an author-controlled section break, not a styling hook. It is useful when a page needs section boundaries that differ from heading boundaries, such as an `h1` and `h2` sharing one hero section, or a section that has no heading. It does not provide a way to keep some Markdown content outside all generated sections.

#### Headings

Heading syntax supports IDs/classes through inline `{ ... }` attributes:

```md
# Title { #intro.hero }
```

Current behavior:

- `{ #id.class }` supports only `id` and `class`.
- Multiple classes work: `{ #id.a.b }`.
- Generated IDs are produced in rendered HTML when `heading_ids` is truthy or when an explicit heading ID exists.
- Generated IDs are lowercased slugs from the first 32 characters of heading text.
- Generated IDs are not deduplicated.
- `doc.headings` in render data is built from top-level document headings only. Headings nested inside blocks/tags are rendered with IDs when `heading_ids` is enabled, but they are not included in the `headings` array.

#### Blocks

Anonymous blocks are tags without a name, usually written as class hooks:

```md
[.note]
  ## Note
  Text
```

They render through the built-in `block` tag:

- Default outer element: `<div>`.
- Outer element with `popover`: `<dialog>`.
- Classes and IDs from shorthand apply to the outer element.
- If nested content has multiple sections, each section becomes an inner `<div>`.
- If nested content has only one section or no sectioning structure, no extra inner divs are added.

This means current docs/examples should not imply `[.hero]` directly renders `<section class="hero">`. It renders a `<div class="hero">`, unless a separate page section wrapper surrounds it.

#### Tags

Tag parsing shape:

```md
[tag#id.class unnamed key="value" flag data-state="open"]
```

Parsing behavior:

- `#id` and `.class` become HTML attributes.
- `class="..."` merges with shorthand classes and deduplicates.
- Allowlisted names become HTML attributes: `id`, `is`, `class`, `style`, `hidden`, `disabled`, `popovertarget`, `popover`, and `data-*`.
- Other names become tag data.
- Booleans and numbers are parsed for inline options: `true`, `false`, `0`, and numeric strings.
- A quoted unnamed value becomes `_`.
- Colon-prefixed data bindings resolve from render data, e.g. `[table :rows="pricing"]`.

Block tag bodies are either YAML data or Markdown blocks, not both. The parser treats a nested body as YAML when it starts with a YAML-looking key or list. If parsed as YAML, `block.blocks` is not populated and `<slot/>` receives no Markdown slot content.

Built-in tags in current source include:

- `block` / anonymous `[.class]`
- `accordion`
- `list`
- `define`
- `image`
- `video`
- `object`
- `table`
- `svg`
- `icon`
- `!` shortcut for image/video based on MIME
- deprecated `button`
- internal `codeblock`

"Built-in tag" means a square-bracket tag with a built-in render handler. Other square-bracket tags are still allowed, but their behavior depends on whether a matching component exists:

| Syntax | Current behavior |
|---|---|
| `[image]`, `[accordion]`, `[table]`, etc. | Handled by Nuemark built-in render functions. |
| `[my-card]` where a matching HTML component exists | Rendered as a custom Markdown tag through Nuekit. |
| `[unknown-tag]` with no matching component | Rendered as a client island stub like `<unknown-tag nue="unknown-tag">...`, not as ordinary static HTML. |

`[div]` and `[section]` are not currently manual native tag insertion in Nuemark. Unless there is a matching custom component, they are treated as unknown tags/client stubs. For arbitrary native HTML structure, use an `.html` file or a custom component.

Accordion caveat: docs say `open="2"` opens the second item, but source compares against the zero-based section index. `open` opens the first item; `open="1"` opens the second; `open="2"` opens the third.

#### Attribute support by rendering path

Current element-producing paths do not all support attributes the same way:

| Rendering path | Element produced | Attribute support |
|---|---|---|
| Nue HTML pages/layouts/components | Arbitrary HTML/SVG/component elements | Broadest support. Static attributes generally pass through, including `id`, `class`, `name`, `data-*`, `aria-*`, etc. Boolean attributes are recognized. `:if`, `:each`, `:is`, and `:on*` are directives. Other colon attributes are component data, not rendered HTML attributes. Static `style` is ignored by the compiler; CSS variable attributes like `--x` are converted to style declarations. |
| Nuemark headings | `<h1>` through `<h6>` | `{ #id.class }` supports only `id` and `class`. No `name`, `data-*`, `aria-*`, etc. |
| Nuemark auto-inserted page sections | `<section>` | `sections: [hero, features]` assigns `class` by index only. No per-section `id`, `name`, `data-*`, or other attributes through config. |
| Nuemark anonymous blocks | `<div>` or `<dialog>` | `[.class]`, `[#id.class]`, plus tag options from Nuemark's tag parser. Supports `id`, `class`, `style`, `hidden`, `disabled`, `popover`, `popovertarget`, and `data-*` as real HTML attributes. Other options become data, not attributes. `popover` changes the outer element to `<dialog>`. |
| Nuemark auto-inserted block divs | inner `<div>` wrappers | Created when a block's nested content is sectionized. No direct author control over their attributes. |
| Nuemark built-in tags | Depends on tag | Shorthand `#id.class` usually applies to the built-in tag's outer element, but each built-in decides where options go. Some options are consumed as data and rendered elsewhere. |
| Nuemark custom tags | Component-defined output | Nuemark parses `id`, `class`, `data-*`, etc., then Nuekit passes them into the component as data and as `attr`. The component must explicitly render them. Nothing automatically applies unless the component template uses `{ class }`, `{ id }`, `:bind`, etc. |
| Nuemark unknown tags | Client island stub | Renders a custom element with `nue="tag-name"` plus parsed attrs. Not suitable as ordinary static structural HTML. |
| Nuemark thematic breaks | `<hr>` | No attribute support. `---` can also become a section separator and then disappear from output when section rendering is enabled. |
| Standard Markdown structural elements | `<p>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, links, images, code | Little or no direct attribute syntax in current Markdown parser. Wrap in blocks/components when attributes are needed. |
| Fenced code blocks | `<pre><code>` optionally wrapped | Code fence info uses the tag parser, so classes can wrap the code block/figure. Some data options such as `numbered` and caption are consumed by rendering. |

Suggested sorted list for final docs:

1. Nue HTML pages/layouts/components
2. Nuemark headings
3. Nuemark auto-inserted page sections
4. Nuemark anonymous blocks
5. Nuemark auto-inserted block divs
6. Nuemark built-in tags
7. Nuemark custom tags
8. Nuemark unknown tags/client island stubs
9. Nuemark thematic breaks
10. Standard Markdown structural elements: paragraphs, lists, blockquotes, links/images/code

#### Current Nuemark docs mismatches to fix

- `nuemark-syntax.md` documents `section_wrapper`, but source does not wire it through Nuekit config/front matter.
- `configuration.md` and `conventions-reference.md` show duplicate `sections:` keys and the unsupported `section_wrapper`.
- Page front matter examples imply flat `sections: false` / `heading_ids: false` can override inherited config; current source uses truthy fallback, so false does not disable inherited true.
- The custom `[card]` example mixes YAML data and Markdown slot content; current parser treats the body as YAML and does not also provide slot Markdown.
- `\|highlighted|` in the enhanced formatting example should not be documented as the mark syntax. The source syntax is `|highlighted|`; the backslash escapes the pipe.
- Nuemark intro/example material implying `[.hero]` generates `<section class="hero">` is inaccurate for current source. Anonymous blocks render `<div>`.
- Accordion `open="2"` is documented as second item, but current source uses zero-based indexes.
- "Fully supports standard Markdown" is too broad for current source. For example, Markdown raw HTML lines are skipped by the block parser, and support is a focused subset plus Nue extensions.

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
- Files in `{app}/ui/{sub-folder}` are **not** auto-included, but can be included using the `include:` config value.
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

> **Warning**: Keep `include:` strings narrow, especially in `site.yaml`. A loose global pattern can expose assets to every page. For example, `include: [console]` in `site.yaml` does not mean "the shared console component"; it means "every walked path containing `console`". If the only match is `admin/console/`, those files become global page dependencies. Prefer a more specific path fragment such as `@shared/lib/console/` or `/lib/console/` when the intent is a particular shared folder.
Similarly, an `include:` in an app's `app.yaml` does **not** automatically scope to the current app's folder. If your search strings are too loose, you risk pulling in files from other apps (pages).

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


### Page Shell Attributes

Some render data properties affect the generated page shell rather than producing visible content or HTML `<meta>` tags. These properties are easy to confuse with document metadata because they can be placed under `meta:`, but their actual effect is on wrapper elements generated by Nuekit.

Current page shell properties to document together:

| Property | Applied to | Current behavior |
|---|---|---|
| `class` | `<body>` | Renders as `<body class="...">` when Nuekit generates the page shell. Multiple class names are written as a space-separated string, e.g. `class: dark heroic`. |
| `language` | `<html>` | Renders as `<html lang="...">`; defaults to `en-US` when unset. |
| `direction` | `<html>` | Renders as `<html dir="...">` when set. |
| `scope` | page wrapper generation | Controls whether Nuekit wraps content in generated `body`, `main`, or `article` elements. Needs more source review before final docs. |

The `class` property is used by the current Nue home page app config:

```yaml
# home/app.yaml
class: dark heroic
```

This produces:

```html
<body class="dark heroic">
```

`class` can currently reach render data in more than one way:

- `meta.class` in `site.yaml` or `app.yaml`, because Nue flattens the `meta:` group into render data.
- Top-level `class` in app/page YAML, because non-configuration top-level YAML keys are merged as template/render data.
- Markdown front matter `class`, which overrides broader data for that page.

Public docs should say clearly that `class` is not related to Nuemark section classes, heading classes, or block classes. It is a page-shell render property for the generated `<body>` element.

Important caveat: this only applies when Nuekit generates the page shell. If a page renders with `scope: body`, or otherwise supplies its own body-level structure, the automatic `<body class="...">` wrapper path is bypassed.


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

Other known metadata-style keys in Nue include `viewport`, `author`, `robots`, `date`/`pubDate`, `language`, `direction`, and `class`. Some become `<meta>` elements; others affect generated page shell attributes. Document `language`, `direction`, and `class` with the Page Shell Attributes reference so users do not mistake them for literal HTML `<meta>` output.

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

- What is Nue? (should this be part of the documenation, or the main site?)
- How do the key parts of Nue work (build system, dev server, prod server, platform adapters)
- Rendering Pipeline
  - Build-time rendering (SSG)
  - Dev-server rendering (SSR)
  - Prod-server rendering (SSR)
  - Client-side rendering (CSR)
- Best Practices (is this the right place, or should be in a different location?)


***
*General information is placed below*

## Meta (not about the Nue documentation itself, but how to do the sub-site)

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


## Nue and ASCS Mismatches / Future Changes

Keep this separate from the main Nuemark docs notes for now. The main public docs should explain current Nue behavior clearly; this section records where current behavior may not be enough for the new docs site's ASCS conventions and semantic HTML/CSS goals.

Current mismatch areas:

- Headings only support `id` and `class` through `{ #id.class }`. They do not support `data-*`, `aria-*`, `name`, or other attributes.
- Auto-inserted page sections only support ordered class assignment through `sections: [hero, features]`. There is no way to assign section IDs, data attributes, names, roles, or multiple structured attribute groups per section.
- Auto-inserted block child divs have no author-controlled attributes. This limits how precisely a content author can align generated wrappers with CSS architecture rules.
- Anonymous blocks are always `<div>` by default, except `popover` switches them to `<dialog>`. There is no Markdown-native way to choose semantic elements such as `section`, `aside`, `nav`, `header`, or `figure` for a generic block.
- `[div]`, `[section]`, and other native-looking square-bracket tags are not native HTML insertion. They become custom tag/component calls or client island stubs unless matching components exist.
- Raw HTML in Markdown is currently skipped by the block parser when lines start with `<`, so Markdown authors cannot fall back to arbitrary semantic HTML inside `.md` files.
- Nuemark square-bracket tag syntax only turns a small allowlist plus `data-*` into real HTML attributes. Other named options become tag/component data. This is powerful for components, but it is not a general HTML attribute model.
- Custom components can implement ASCS-compatible output, but each component must deliberately pass through or map `id`, `class`, `data-*`, and other attributes. The Markdown call site alone does not guarantee the final HTML shape.
- The `sections: false` and `heading_ids: false` front matter behavior is currently weaker than expected because false values fall back to inherited truthy config.
- There's no way in Nue to set attributes on `html`, `head`, and `body` elements unless you set `scope: html` (for markdown files), or manually start your html files with `<html>`. To avoid having to do that we propose a new .yaml configuration feature under the `design:` group:
  ```yaml
  design:
    html_attributes:
      {attribute}: {value}
    head_attributes:
      {attribute}: {value}
    body_attributes:
      {attribute}: {value}    
  ```

Possible future changes to evaluate:

- Add a supported Nuemark syntax for choosing semantic block elements, for example an explicit element option on anonymous blocks, or a small set of built-in semantic block tags.
- Add a general, documented attribute pass-through model for Nuemark-generated elements, with clear rules for `id`, `class`, `name`, `data-*`, `aria-*`, `role`, and boolean attributes.
- Extend auto section configuration beyond ordered class names so sections can receive richer per-section attributes.
- Decide whether raw HTML should be supported in Markdown, and if so under what safety and parsing rules.
- Fix page-level false overrides for `sections` and `heading_ids` so local front matter can disable inherited behavior.
- Revisit `section_wrapper` / `content_wrapper`: either wire and document it properly, or remove it from public docs until the feature exists.
- Consider whether unknown native-looking tags such as `[section]` should render static HTML, require explicit component definitions, or fail loudly. The current client-stub behavior is surprising for documentation authors.
- Define component-author conventions for passing through attributes so custom Markdown tags can produce predictable, semantic HTML without one-off template decisions.
- Current design-related configuration should be moved under the `design:` group. Examples are `class` and `scope`. Research other similar configuration properties.

Tor's current direction: good documentation is imperative for the current behavior, but future upgrades or rewrites may be needed to simplify the mental model and better support ASCS plus general semantic HTML/CSS authoring.
