# Nue Rendering Modes: Research & Design Notes
*Session notes — May 2026*

---

## Overview

This document covers research and design thinking on combining SSG, SSR, and CSR rendering modes in Nue, including current support status, a proposed multi-pass architecture, syntax options, an incremental implementation roadmap, and worked examples across three real-world scenarios.

---

## Current Rendering Mode Support

### What Nue Supports Today

| Combination | Status | Notes |
|---|---|---|
| SSG only | ✅ Full | `.md` and `<!doctype html>` files |
| CSR only | ✅ Full | `<!doctype dhtml>` SPA entry |
| SSG + CSR (islands) | ⚠️ Partial | Island stubs work; no pre-rendered hydration |
| SSR only | ❌ Missing | `c.render()` not yet implemented |
| SSG + SSR | ❌ Missing | Requires SSR first |
| SSR + CSR | ❌ Missing | Requires SSR first |
| SSG + SSR + CSR | ❌ Missing | All three combined |

### How the Current SSG + CSR Island Mechanism Works

When a Nuemark tag in an SSG `.md` page has no server-side renderer, `render-tag.js` emits a bare stub:

```html
<!-- Source: [contact-form cta="Submit"] in an .md page -->
<contact-form nue="contact-form">
  <script type="application/json">{"cta":"Submit"}</script>
</contact-form>
```

`mount.js` is conditionally injected into the page head when DHTML libs are in scope. It:
1. Queries all `[nue]` elements in the document
2. Dynamically imports compiled DHTML lib modules
3. Calls `mount(comp, { root, data })` for each island — **replacing** the stub with fresh DOM

**Key limitation:** The island stub is a bare placeholder, not SSG-rendered content. There is no partial hydration — `mount()` replaces, not enhances. True SSG+CSR (pre-render at build time, attach reactive bindings in browser) would require a `hydrate()` path that walks existing DOM instead of generating fresh DOM.

### The `<!html+dhtml>` Isomorphic Library

`<!doctype html+dhtml lib>` marks a component library as isomorphic — it participates in both SSG renders and client-side mounting. This is the closest Nue currently gets to a unified rendering approach. The `isomorphic` flag in `asset.js` controls inclusion in both pipelines:

```js
const same_type = is_dhtml == ast.is_dhtml
const isomorphic = doctype.startsWith('html+dhtml')
const forced = force_html && !ast.is_dhtml
if (isomorphic || same_type || forced) ret.push(...ast.lib)
```

---

## The Multi-Pass Rendering Vision

### Core Concept: A Pipeline, Not Magic

Three sequential rendering passes over source files, each consuming its own token namespace and leaving others intact:

```
source file(s)
  │
  ▼ Build time (SSG): resolve static tokens  →  intermediate artifact
  │                                              (SSR + CSR tokens still literal)
  ▼ Request time (SSR): resolve server tokens →  page.html
  │                                              (CSR tokens still literal)
  ▼ Browser time (CSR): mount reactive tokens →  live DOM
```

**Critical discipline:** Each pass must skip the other passes' tokens. The SSG compiler treats SSR tokens as opaque text. The SSR renderer emits CSR tokens as-is.

### Rendering Mode Spectrum (Extended)

```
SSG (build time)           →  renderNue() at build, output to .dist/
SSR (request time)         →  renderNue() per request, return HTML Response  ← MISSING
CSR/SPA (browser time)     →  compileNue() to JS, mount() in browser
Isomorphic (html+dhtml)    →  renders on both server and client
SSG+SSR+CSR (multi-pass)   →  pipeline across all three stages  ← future
```

All modes use the **same rendering engine** (nuedom). Only the *when* and *where* differs.

### Existing Building Blocks

| Piece | Status | Location |
|---|---|---|
| SSG engine | ✅ Exists | `nuedom/src/index.js` — `renderNue(ast, data)` |
| CSR engine | ✅ Exists | `nuedom/src/nue.js` — `mount()` |
| Island stubs (SSG→CSR) | ✅ Exists | `nuemark/src/render-tag.js` — `renderIsland()` |
| Client hydration | ✅ Exists | `nuekit/client/mount.js` — `mountAll()` |
| SSR runtime | ❌ Missing | `c.render()` + template resolution |
| Pre-rendered island HTML | ❌ Missing | Hydrate rather than replace |
| Multi-pass token parser | ❌ Missing | Requires new parser layer |

---

## Token Syntax Options for Mixed-Mode Files

*Note: This is only relevant if single-file multi-mode templates are desired. File-level separation (Option D) avoids the need entirely.*

### Current Syntax (SSG/CSR unified — works because they never share a file)

| Construct | Syntax |
|---|---|
| Attribute directive | `:each`, `:if`, `:onclick` |
| Expression | `{ value }` |
| Unescaped HTML | `{{ html }}` |

### Option A: Sigil Prefix

| Pass | Attribute | Expression |
|---|---|---|
| SSG | `:each` | `{ name }` |
| SSR | `::each` | `{{ name }}` — **conflict** with existing unescaped HTML syntax |
| CSR | `:each` | `{ name }` |

**Problem:** `{{ }}` already means unescaped HTML in Nue. Double-colon/double-brace would break existing semantics.

### Option B: Namespace Prefix

| Pass | Attribute | Expression |
|---|---|---|
| SSG | `:each` | `{ name }` |
| SSR | `s:each` | `{s name }` or `{# name }` |
| CSR | `:each` | `{ name }` |

`s:` for server-rendered attributes. Expression delimiter is the harder design problem — no obvious standard exists.

### Option C: Element-Level Scoping (No New Token Types)

Rather than per-token sigils, scope passes to elements using a wrapper element:

```html
<!doctype html+shtml+dhtml>

<main>
  <!-- SSG: resolved at build time -->
  <h1>{ page.heading }</h1>
  <p class="tagline">{ page.tagline }</p>

  <!-- SSR: resolved at request time -->
  <server>
    <h2>{ product.name }</h2>
    <p>{ product.description }</p>
    <strong class="price">{ product.price }</strong>
  </server>

  <!-- CSR: mounted in browser -->
  <product-variants/>
</main>
```

**Advantage:** No new token syntax. Consistent with Nue's "structure is architecture" philosophy. The `<server>` wrapper element signals the pass boundary.

**Tradeoff:** Less granular — you can't interleave SSR and SSG expressions within the same element.

### Option D: File-Level Separation (Recommended for Incremental Path)

Three separate files with different doctypes, composed via island tags:

```
page/
  index.md / index.html   ← SSG  (<!doctype html>)
  component.shtml         ← SSR  (<!doctype shtml>)  ← NEW doctype needed
  widget.html             ← CSR  (<!doctype dhtml lib>)
```

- No new syntax at all — just a new doctype
- Each file's rendering contract is immediately clear from its extension/doctype
- Composition via Nuemark island tags works identically for SSR and CSR stubs
- Caching, deployment, and update semantics are self-documenting per file

**When single-file syntax (A/B/C) would genuinely help:** Only when SSR and static data are so visually interleaved that separating them into files would split one logical paragraph. In practice, the scenarios below suggest this is rare.

---

## Data Classification Framework

Before choosing rendering modes, classify data by change frequency:

| Frequency | Rendering Mode | Examples |
|---|---|---|
| Almost never | SSG | CMS text, brand copy, page structure, labels |
| Per-request / daily | SSR | DB records, personalized content, current prices |
| Sub-minute / user-driven | CSR | Live scores, weather, variant selection, cart |

---

## Scenario 1: Product Shopping Page

### Data Classification

| Data | Frequency | Mode |
|---|---|---|
| Page chrome, labels, category headings | Almost never | SSG |
| Product name, base price, description, main image | Per product URL | SSR |
| Variant specs (dimensions, weight, variant price) | User-driven | CSR |
| Inventory indicator, cart state | User-driven | CSR |

### File Structure (Option D)

```
products/
  [slug]/
    index.html          ← SSG shell: layout, labels, navigation
    product.shtml       ← SSR: product data block
    variants.html       ← CSR dhtml lib: variant selector + specs
```

### SSG Shell — `index.html`

```html
<!doctype html>
<main>
  <h1>{ page.heading }</h1>
  <p class="tagline">{ page.tagline }</p>

  <product-data/>       <!-- SSR island stub, rendered at request time -->
  <product-variants/>   <!-- CSR island stub, mounted in browser -->
</main>
```

### SSR Component — `product.shtml`

```html
<!doctype shtml>
<article :is="product-data">
  <h2>{ product.name }</h2>
  <p>{ product.description }</p>
  <strong class="price">{ product.price }</strong>
</article>
```

### CSR Component — `variants.html`

```html
<!doctype dhtml lib>
<section :is="product-variants">
  <select :onchange="selectVariant(this.value)">
    <option :each="v in variants" :value="v.id">{ v.name }</option>
  </select>
  <dl>
    <dt>Weight</dt><dd>{ selected.weight }</dd>
    <dt>Dimensions</dt><dd>{ selected.dimensions }</dd>
  </dl>
  <script>
    async mounted() {
      const { variants } = await fetch('/api/product/' + productId + '/variants').then(r => r.json())
      this.update({ variants, selected: variants[0] })
    }
    selectVariant(id) {
      this.update({ selected: this.variants.find(v => v.id == id) })
    }
  </script>
</section>
```

### Single-File Alternative (Option C)

```html
<!doctype html+shtml+dhtml>

<main>
  <!-- SSG: baked at build time from CMS -->
  <h1>{ page.heading }</h1>
  <p class="tagline">{ page.tagline }</p>

  <!-- SSR: resolved at request time from product DB -->
  <server>
    <h2>{ product.name }</h2>
    <p>{ product.description }</p>
    <strong class="price">{ product.price }</strong>
  </server>

  <!-- CSR: reactive in browser when variant changes -->
  <product-variants/>
</main>
```

---

## Scenario 2: Golf Club Page

### Data Classification

| Data | Frequency | Mode |
|---|---|---|
| Club history, course/range descriptions, facilities | Almost never | SSG |
| Today's scorecard / leaderboard | After each round (~daily) | SSR |
| Current weather | ~10 min refresh | CSR |
| Tee times (next 2 hours) | ~5 min refresh | CSR |
| Booking form | User-driven | CSR |

### File Structure (Option D)

```
golf/
  [club-slug]/
    index.md            ← SSG: club info in Markdown/CMS
    scorecard.shtml     ← SSR: today's leaderboard from DB
    live.html           ← CSR dhtml lib: weather + tee-times
```

### SSG Content — `index.md`

Nuemark island tags compose all three rendering modes from a Markdown source:

```markdown
---
title: Rotary Golf Club
---

# Rotary Golf Club

Founded in 1923, the club spans 18 holes across 200 acres...

[scorecard]           <!-- SSR island: leaderboard from DB -->
[live-conditions]     <!-- CSR island: weather + tee-times -->
```

### SSR Component — `scorecard.shtml`

```html
<!doctype shtml>
<section :is="scorecard">
  <h2>Today's Leaderboard</h2>
  <table>
    <tr :each="row in leaderboard">
      <td>{ row.rank }</td>
      <td>{ row.player }</td>
      <td>{ row.score }</td>
    </tr>
  </table>
</section>
```

### CSR Component — `live.html`

```html
<!doctype dhtml lib>
<aside :is="live-conditions">
  <div class="weather">
    <p>{ weather.temp }° — { weather.description }</p>
    <p>Wind: { weather.wind_speed } km/h { weather.wind_dir }</p>
  </div>

  <div class="tee-times">
    <h3>Upcoming Tee Times</h3>
    <ul>
      <li :each="slot in teetimes">
        { slot.time } — { slot.players } players
      </li>
    </ul>
  </div>

  <script>
    async mounted() {
      const poll = async () => {
        const data = await fetch('/api/live/' + clubId).then(r => r.json())
        this.update(data)
      }
      poll()
      setInterval(poll, 60_000)   // refresh every minute
    }
  </script>
</aside>
```

### Key Observation

The scorecard and the live conditions have meaningfully *different update contracts*:
- Scorecard: per-request DB query, can be edge-cached for hours
- Live conditions: real-time polling, never cached

File-level separation makes these contracts visible without reading the code. In a single-file sigil approach, these decisions would be invisible unless separately documented.

---

## Scenario 3: Soccer Fan Portal

### Data Classification

| Data | Frequency | Mode |
|---|---|---|
| Club branding, hero image, nav, section headings | Almost never | SSG |
| League standings table | After each match (~daily) | SSR |
| Recent match results, player stats | After each match (~daily) | SSR |
| Live match ticker, real-time score | Sub-minute (WebSocket) | CSR |
| Social media feed | ~5 min polling | CSR |

### File Structure (Option D)

```
fans/
  [team-slug]/
    index.md            ← SSG: branding, hero, static sections
    stats.shtml         ← SSR: standings + recent results from DB
    live.html           ← CSR dhtml lib: match ticker + social feed
```

### SSG Content — `index.md`

```markdown
---
team: Manchester City
league: Premier League
---

# { team } Fan Hub

Your home for all things { team }.

[standings]           <!-- SSR island -->
[match-ticker]        <!-- CSR island -->
[social-feed]         <!-- CSR island -->
```

### SSR Component — `stats.shtml`

```html
<!doctype shtml>
<section :is="standings">
  <h2>{ league } Table</h2>
  <table>
    <tr :each="club in table" class="{ club.id == teamId ? 'highlight' : '' }">
      <td>{ club.pos }</td>
      <td>{ club.name }</td>
      <td>{ club.pts }</td>
      <td>{ club.gd }</td>
    </tr>
  </table>
</section>
```

### CSR Components — `live.html`

Two distinct widgets with different update mechanisms coexist in one CSR lib file:

```html
<!doctype dhtml lib>

<!-- WebSocket-driven live score ticker -->
<aside :is="match-ticker">
  <p :if="!match">No live match today</p>
  <div :if="match" class="live-score">
    <span class="teams">{ match.home } { match.home_score } — { match.away_score } { match.away }</span>
    <span class="minute">{ match.minute }'</span>
    <span class="status">LIVE</span>
  </div>
  <script>
    mounted() {
      const ws = new WebSocket('/live/scores/' + teamId)
      ws.onmessage = ({ data }) => this.update(JSON.parse(data))
      ws.onerror = () => this.update({ match: null })
    }
  </script>
</aside>

<!-- Polling-driven social feed -->
<section :is="social-feed">
  <article :each="post in posts">
    <p>{ post.text }</p>
    <time>{ post.time }</time>
    <a :if="post.url" :href="post.url">View</a>
  </article>
  <script>
    async mounted() {
      const refresh = async () => {
        const { posts } = await fetch('/api/social/' + teamId).then(r => r.json())
        this.update({ posts })
      }
      refresh()
      setInterval(refresh, 300_000)   // refresh every 5 minutes
    }
  </script>
</section>
```

---

## Cross-Scenario Conclusions

### Pattern That Emerges Consistently

Each rendering mode groups naturally into its own coherent file across all three scenarios. The file-level separation is not a burden — it reflects genuinely different operational characteristics.

### Deployment and Caching Implications (Self-Documenting with Option D)

| File type | Caching strategy | Deploy target |
|---|---|---|
| SSG (`.md`, `<!doctype html>`) | CDN edge cache forever | Static CDN |
| SSR (`<!doctype shtml>`) | Short TTL or no cache | Edge worker / server |
| CSR (`<!doctype dhtml lib>`) | JS bundle, long cache | CDN (static JS file) |

With file-level separation, these deployment decisions are visible in the project structure. With a single-file sigil approach, they require separate documentation or configuration.

### Where Single-File Syntax Would Genuinely Help

Only when SSR and SSG content are so interleaved that separating them would split one logical visual block across two files. The product page comes closest — the product name, price, and surrounding CMS labels are tightly coupled visually. Even there, the file boundary is not a serious burden.

### Recommendation

**Option D (file-level) for the incremental implementation path.** Island composition via Nuemark tags already works for SSG→CSR and would work identically for SSG→SSR once `<!doctype shtml>` exists. No new syntax needed for steps 1–4 of the roadmap.

The single-file multi-pass syntax (Options A/B/C) is worth revisiting *after* real SSR usage reveals whether file-per-mode is actually a friction point in practice.

---

## Incremental Implementation Roadmap

### Step 1: Complete SSG + CSR (Hydration)

**What's missing:** True partial hydration. Currently `mount()` replaces island stubs with fresh DOM. Pre-rendering the island HTML at build time and then attaching reactive bindings to existing DOM requires a `hydrate()` path.

**Changes needed:**
- `renderNue(componentAST, staticData)` at build time into the island element (not just a `nue` attribute stub)
- Add `hydrate(wrap)` to `nue.js` / `mount.js` — walks existing DOM, attaches bindings rather than replacing content
- No new syntax required

### Step 2: Implement SSR (`<!doctype shtml>`)

**What's needed:**
- `c.render('template-name', data)` in nueserver context
- New doctype: `<!doctype shtml>` to signal "render at request time"
- Template resolution via nuekit's asset/dependency system
- SSR components use identical syntax to SSG components — same `renderNue()` engine, different timing

**Token syntax decision:** Only needed at this step if you want SSR and SSG syntax to coexist in one file. With file-level separation, no new syntax is needed.

**Example route handler (proposed API):**
```js
get('/product/:slug', async (c) => {
  const product = await c.env.products.get(c.req.param('slug'))
  return c.render('product-data', { product })
})
```

### Step 3: Implement SSG + SSR

**What's needed:**
- SSG output for pages containing SSR island stubs becomes an intermediate artifact (`.shtml`) rather than a final `.html` file
- Nueserver serves these intermediate artifacts by rendering their SSR sections at request time
- Same Nuemark island tag mechanism: unknown tags in SSG become SSR stubs (instead of or in addition to CSR stubs)

### Step 4: Implement SSR + CSR

**What's needed:**
- SSR pages can emit CSR island stubs (same `renderIsland()` mechanism as SSG→CSR)
- Hydration from Step 1 already handles the client side
- No additional syntax needed

### Step 5: SSG + SSR + CSR

Falls out of combining Steps 1–4. No new concepts — just the full pipeline operating together.

```
Step 1: Complete SSG + CSR hydration     (no new syntax)
Step 2: SSR standalone                   (new doctype: shtml)
Step 3: SSG + SSR composition            (island tags for SSR)
Step 4: SSR + CSR composition            (reuse Step 1 hydration)
Step 5: SSG + SSR + CSR                  (all three together)
```

---

## Key Design Principles (Emerging from Analysis)

1. **Same template syntax across all modes.** `renderNue()` is the engine for SSG and SSR. CSR compilation uses the same AST. Developers learn one language for all three modes.

2. **Doctype declares the rendering contract.** The doctype (or file extension) is the single source of truth for when and where a component renders. No per-line annotations needed.

3. **Island composition via Nuemark tags scales to all modes.** The existing `renderIsland()` mechanism is the right extension point — it just needs to know whether to emit a CSR stub or an SSR stub based on what's available.

4. **Defer the single-file syntax decision.** File-level separation is sufficient for the incremental path and produces clearer, more deployable code. Single-file multi-mode templates are a future design problem, not a prerequisite.

5. **`c.env` must remain a pure interface.** The data binding layer (local JSON mock → CF KV/D1 → any adapter) is independent of rendering mode. SSR templates should be able to use `c.env` with the same abstraction as JSON API routes.

---

## Feature Coverage Across Rendering Modes
*From May 2026 session — mapping current SSG inventory against SSR and CSR*

`✓` = implemented, `~` = partial / groundwork only, `—` = not present

### Table 1 — Current Nue features

| Feature | SSG | SSR | CSR |
|---|:---:|:---:|:---:|
| Nue HTML templating | ✓ | ✓ | ✓ |
| Layout system + named slots | ✓ | ✓ | ~ |
| Component types (lib, dhtml, reactive, isomorphic) | ✓ | ~ | ✓ |
| Content sources (Markdown, HTML, JS/TS, YAML, JSON) | ✓ | ✓ | — |
| Data sources (frontmatter, app.yaml, @shared/data) | ✓ | ✓ | ~ |
| Content collections | ✓ | ~ | — |
| Routing | ✓ | ✓ | — |
| Asset pipeline | ✓ | ✓ | ✓ |
| Markdown (Nuemark) | ✓ | ✓ | — |
| SEO / meta | ✓ | ✓ | ~ |
| Config (site.yaml / app.yaml cascade) | ✓ | ~ | — |
| Output (HTML, JS, CSS, RSS, sitemap) | ✓ | ~ | — |
| Dev tooling (HMR, file watch, dev server) | ✓ | ~ | ✓ |

*Routing note: SSG uses file-based routing resolved at build time. SSR uses handler-based routing via Nueserver (`get()`, `post()`, `use()`) resolved at request time. CSR client-side navigation (History API) is not yet in Nue.*

### Table 2 — Missing rendering features (HTML rendering focused)

| Feature | SSG | SSR | CSR |
|---|:---:|:---:|:---:|
| Request-time rendering (`renderNue()` per request) | — | ✓ | — |
| Server-side data fetching (load functions before render) | — | ✓ | — |
| Streaming HTML (send page in chunks as data resolves) | — | ✓ | — |
| Partial hydration / islands (static shell + reactive zones) | ~ | ✓ | ✓ |
| On-demand / incremental rebuild (ISR-style) | ~ | ✓ | — |
| Draft / preview mode (render unpublished content) | — | ✓ | — |
| Server-side form handling (POST → render → response) | — | ✓ | ~ |
