# State-of-the-Art Tech Documentation Website — Design Overview

*Input for the Nue and Archie documentation design process.*

***

## Executive Summary

Outstanding technical documentation is not merely a collection of reference pages — it is a designed learning and working environment. The best-in-class examples (Stripe, Vercel, Linear, Mintlify, Tailwind CSS) share a common DNA: content-first architecture, ruthless information hierarchy, frictionless navigation, and a visual language tuned specifically for developers. Increasingly, docs must also serve two audiences simultaneously: human readers and AI agents that crawl and summarize the content. This overview synthesises findings from real documentation sites, UX research, and the Diátaxis framework into actionable design principles for Nue and Archie.

***

## 1. Conceptual Foundation: Three Layers of Documentation Knowledge

Before designing a page, it helps to understand what kind of knowledge is required to create great documentation. The background research in the attached document describes this as three distinct layers:[^1]

| Layer | Name | What it covers |
|-------|------|----------------|
| 1 | Subject/domain knowledge | How the product, API, or framework actually works |
| 2 | Communication knowledge | How to explain it clearly and accurately |
| 3 | Learning/design knowledge | How to structure material so the reader becomes *capable*, not just *informed* |

Layer 3 — learning/design knowledge — is the layer that is most often neglected, and it is the one that separates truly excellent documentation from adequate documentation.[^1]

***

## 2. Content Architecture: The Diátaxis Framework

The single most influential structural framework in modern technical documentation is **Diátaxis**, which identifies four fundamentally different types of content that answer four different user needs:[^2]

| Type | User state | Purpose | Analogy |
|------|-----------|---------|---------|
| **Tutorial** | Learning | Guided, hands-on acquisition of skill | A cooking class |
| **How-to guide** | Working | Step-by-step help for a specific goal | A recipe |
| **Reference** | Working | Accurate, neutral technical description | A dictionary |
| **Explanation** | Studying | Background, context, why things work | A textbook chapter |

These four types must be **kept separate** in the information architecture. Mixing them — placing conceptual explanation inside an API reference, for example — is the primary cause of confusing documentation.[^3]

Diátaxis also maps progression: users typically move from tutorials → how-to guides → reference → explanation as their expertise grows. The navigation structure should support this journey, not fight it.[^3]

### Practical implication for Nue/Archie
- A **Getting Started** section = tutorials (user is on rails, no decisions required)
- **Guides** section = how-to guides (competent user, real-world task)
- **Reference** section = pure technical facts (API, config, CLI, component props)
- **Concepts / Architecture** section = explanation (the "why")

***

## 3. Information Architecture & Navigation

### 3.1 The Three-Panel Layout

The dominant layout pattern for developer documentation in 2025 is a **three-column arrangement**:[^4][^5]

1. **Left sidebar** — persistent hierarchical navigation (site-wide and section-level)
2. **Main content area** — the document, with generous reading width (65–80ch max)
3. **Right rail** — "On this page" anchor-link table of contents for the current page

This layout ensures users always know *where they are in the whole site* (left), *what section they are in on this page* (right), and can focus entirely on *reading* (center).

### 3.2 Sidebar Design Principles

The left sidebar is the primary orientation tool and deserves careful attention:[^5][^6]

- **Group by user intent**, not internal org-chart categories. "Workspace", "Build", "Deploy" resonates more than "Module A", "Module B"
- **Limit nesting to 2–3 levels maximum**. Deep accordion hierarchies cause orientation loss
- **Persist active/selected states clearly** — use a left-border accent or background fill, not just color change alone
- **Use section headings** (non-clickable labels) to visually separate Diátaxis content types
- **Separate utility links** (Changelog, GitHub, Community) from learning/working links — Stripe does this by placing developer utilities in the footer of the sidebar[^7]
- On mobile: collapse to a **drawer pattern** with an obvious open control

### 3.3 Right-Rail Table of Contents

A sticky "On this page" TOC is now a standard feature of high-quality documentation. It:[^8]
- Updates its active item as the user scrolls (scroll-spy)
- Uses 2 heading levels maximum (H2 and H3)
- Stays within a fixed column so it never competes with reading content

### 3.4 Top-Level Navigation

The top navigation bar should be minimal and stable:[^4]
- Product name / logo (home link)
- Section switcher for major doc areas (e.g., Docs | API | Blog)
- Global search (keyboard shortcut Cmd/Ctrl+K)
- GitHub link
- Version selector (if applicable)
- Dark/light mode toggle

***

## 4. Search: The Most Critical Feature

Users arrive at documentation with a specific question. Search must answer it immediately.

### 4.1 Characteristics of Excellent Search

- **Keyboard-first**: `Cmd/Ctrl+K` opens a command palette-style modal — the pattern popularized by Linear, now standard in Tailwind CSS, Vercel, and Mintlify[^7]
- **Instant results**: results appear as the user types (< 100ms response)
- **Hierarchical results**: results show page title *and* section heading so users know the exact location[^9]
- **Typo-tolerant**: handles misspellings (Algolia DocSearch provides this out of the box)[^9]
- **Context-aware snippets**: result previews show the surrounding sentence, not just the page title

### 4.2 Structure for Search Relevance

DocSearch and other indexers use the **heading hierarchy** (`h1`–`h6`) to build relevance context. Pages must use a clean, non-skipped heading structure. Recommend at minimum 3 levels of headings per page (h1, h2, h3) for adequate search faceting.[^9]

### 4.3 AI-Assisted Search (2025 Standard)

Documentation search is shifting from keyword lookup to semantic/conversational:[^10][^11]
- Algolia now offers **Ask AI** within DocSearch, interpreting natural-language queries
- An **AI answer box** at the top of search results summarizes answers with citations to specific pages
- `llms.txt` — a machine-readable outline of the entire doc site — has become a de facto standard for surfacing content in LLM interfaces (Claude, ChatGPT, Perplexity)[^11]
- `llms-full.txt` provides a complete Markdown dump used by customer-facing AI agents[^11]

For Nue and Archie, implementing `llms.txt` from day one is strongly recommended. Documentation that is not structured for AI readers will progressively lose discoverability.[^11]

***

## 5. Page-Level Content Design

### 5.1 The Anatomy of an Excellent Doc Page

| Zone | Contents |
|------|----------|
| **Page header** | H1 title (descriptive, not cute), optional 1-sentence lead |
| **Body** | Organized prose with H2/H3 sections; short paragraphs (3–5 sentences) |
| **Code blocks** | Syntax-highlighted, copyable, language-labeled, themed for dark/light mode |
| **Callouts** | Tip, Note, Warning, Danger — visual differentiation by color and icon |
| **Tables** | For parameter references, option matrices, comparisons |
| **Next steps** | Links to related pages at the bottom (reduces dead ends)[^12] |

### 5.2 Code Block Requirements

Code is the primary content of developer documentation. Code blocks must:[^13][^14]
- Show the **language label** (e.g., `bash`, `js`, `yaml`)
- Have a **one-click copy button**
- Adapt syntax highlighting to light and dark mode independently (not just inverting colors)
- For multi-language examples, use a **tabbed switcher** (Stripe's pattern: JavaScript/Python/Ruby tabs side by side with the prose)
- Avoid truncating examples — the full, runnable snippet is always more useful than a partial one

### 5.3 Interactive Code Examples

Best-in-class documentation increasingly includes **live, runnable examples**:[^15][^16]
- Embedded playgrounds (CodePen-style iframes or tools like Codapi) let users modify and run code without leaving the docs
- MDN's "Live Samples" model — HTML/CSS/JS code blocks render their output in-page — is a reference implementation[^16]
- For framework docs like Nue, a **sandboxed REPL** that shows a Nue component's output alongside its source is extremely valuable
- Interactive examples dramatically reduce time-to-first-success, which is the most critical metric for developer adoption

### 5.4 Writing Style

Following the communication knowledge principles from the attached document:[^1]
- **Plain language first**: explain concepts before using jargon; never assume more than the current page establishes
- **Active voice**: "Call `nue.init()` to start the server" not "The server is started by calling..."
- **One idea per paragraph**: short paragraphs reduce cognitive load and help AI chunking[^11]
- **Consistent terminology**: pick one term per concept and use it everywhere (e.g., always "component", never alternating with "widget" or "element")[^4]
- **Imperative mood for instructions**: "Install the CLI" not "You should install the CLI"

***

## 6. Visual Design & Typography

### 6.1 Typography System

Documentation has specific typographic requirements that differ from marketing pages:[^17][^18]

- **Body font**: a legible sans-serif at 16–18px. Geometric sans-serifs (Inter, Geist) are dominant in developer tools; they read well at screen resolution
- **Monospace font**: essential for inline code, code blocks, CLI output. Geist Mono, JetBrains Mono, or Fira Code are good choices
- **Line height**: 1.6–1.75 for body copy; tighter (1.3–1.4) for headings
- **Measure (line length)**: 60–75 characters per line for body text — wider lines force excessive eye travel and hurt readability[^18]
- **Heading scale**: clear visual hierarchy from H1 to H3; H4 and below should be used sparingly and are often better replaced by bold labels in lists

### 6.2 Color System

| Use | Recommendation |
|-----|----------------|
| Background | Off-white (`#FAFAFA`) in light mode, dark gray (`#0F0F0F`–`#121212`) in dark mode |
| Surface/card | Pure white / `#1A1A1A` |
| Text primary | Near-black `#111` / near-white `#F5F5F5` — minimum 7:1 contrast |
| Accent | Single brand accent color used for links, active states, callout borders |
| Warning/note callouts | Amber, blue, red — always paired with an icon (never color-only)[^12] |
| Code block background | Subtle off-white / `#161616` — not pure black or white |

### 6.3 Dark Mode

Dark mode is **expected** by the developer audience. Implementation requirements:[^19][^20]
- System preference respected via `prefers-color-scheme`; user override stored in localStorage
- Code syntax themes must be **different** for each mode (a GitHub-light theme in light, a GitHub-dark or Dracula theme in dark) — do not simply invert colors[^14][^21]
- Callout backgrounds must maintain sufficient contrast in both modes

### 6.4 Spacing & Layout

- Use an **8px base grid** for consistent spacing
- Content area max-width: `720px`–`800px` for prose pages; `1100px`–`1280px` for reference/API pages with a two-column layout
- Generous vertical whitespace between sections — this is not "wasted space", it is readability infrastructure

***

## 7. Component Patterns

### 7.1 Callouts / Admonitions

Use 4 semantic levels with distinct visual treatment:[^8]

| Type | When to use | Color |
|------|-------------|-------|
| **Note** | Additional context | Blue |
| **Tip** | Recommended practice or shortcut | Green |
| **Warning** | Risk of incorrect behavior | Amber |
| **Danger** | Risk of data loss or security issue | Red |

Each callout should have a leading icon + color + bold label — never rely on color alone.[^12]

### 7.2 API / Parameter Tables

Reference pages for APIs, configuration options, and component props should use a consistent table format:

```
| Parameter | Type     | Default | Description         |
|-----------|----------|---------|---------------------|
| `debug`   | boolean  | false   | Enable verbose logs |
```

Parameters with required status should be clearly marked (asterisk, "required" badge, or separate column).[^13]

### 7.3 Version Badges and Status Indicators

- Indicate when a feature was introduced: `Since v2.1`, `Beta`, `Deprecated`
- Use subtle inline badges; do not clutter the primary reading flow

### 7.4 Breadcrumb Navigation

Breadcrumbs are particularly important in deep hierarchies. They should:[^22]
- Appear below the top nav, above the H1
- Reflect the sidebar hierarchy
- All segments should be links

***

## 8. Page Types and Their Specific Requirements

| Page type | Key design requirements |
|-----------|------------------------|
| **Getting Started / Tutorial** | Linear progression, no decision-making, clear "what you'll build", prerequisites box at top, numbered steps, expected output shown |
| **How-to Guide** | Goal stated in title (e.g., "How to deploy to Cloudflare Pages"), prerequisite check, numbered steps, troubleshooting section at end |
| **API Reference** | Two-column layout (description left, code right), full parameter tables, HTTP method badges, request/response examples, error codes |
| **Concept / Explanation** | Long-form prose, generous use of diagrams, no step-by-step instructions, links to related reference pages |
| **Changelog / Release Notes** | Date-ordered, version headers, semantic grouping (Added / Changed / Fixed / Removed) |

***

## 9. AI-Native Documentation (The 2025 Requirement)

This is the most significant emerging shift in documentation design:[^11]

### 9.1 Structural Optimization for LLMs

- Keep each H2 section self-contained — LLMs chunk at heading boundaries[^11]
- Use **canonical, consistent phrasing** for product concepts (e.g., always "Nue component", not sometimes "Nue element" or "widget")[^11]
- Avoid orphan content — every chunk of text should belong to a clearly titled section
- Prefer tables and lists over dense prose for structured facts — machines parse them more reliably[^11]

### 9.2 Machine-Readable Infrastructure

- **`/llms.txt`**: A human- and machine-readable outline of all documentation pages with short summaries. Now crawled by Claude, ChatGPT, Perplexity, and Cursor[^11]
- **`/llms-full.txt`**: Complete Markdown dump of all pages for AI agents answering support queries
- **`/sitemap.xml`**: Traditional but still required for search indexing[^9]
- **Semantic HTML**: Meaningful tag choices (`<article>`, `<nav>`, `<aside>`, `de>`, `<pre>`) improve AI parsing and accessibility simultaneously[^23]

### 9.3 MCP Integration (Forward-Looking)

Model Context Protocol (MCP), introduced by Anthropic, allows AI coding assistants like Claude and Cursor to query documentation directly in real-time. Forward-looking documentation platforms (Mintlify, GitBook) are already building MCP server generation from documentation sources. This is the path to docs appearing directly in IDEs.[^11]

***

## 10. Performance & Technical Requirements

Slow documentation is abandonware. The bar is high:[^23]

- **Time to First Contentful Paint**: < 1 second on a 4G connection
- **No layout shift (CLS = 0)**: Navigation and sidebars must not reflow during load
- **Static generation**: Documentation should be fully static HTML/CSS — no client-side rendering for the main content
- **Prefetching**: Hover-intent prefetch of linked pages (Docusaurus, Astro, and Nue all support this)
- **Font loading**: Use `font-display: swap` and subset fonts; avoid loading multiple font weights unnecessarily
- **Zero-JS fallback**: Core reading experience must work without JavaScript

The Nue framework's "standards-first" philosophy — content arrives with styling in a single request, no framework initialization, no cumulative layout shift — is architecturally well-suited to meet these requirements.[^23]

***

## 11. Accessibility

Documentation that fails accessibility fails a significant portion of developers:[^18]

- WCAG AA minimum for all text (4.5:1 contrast); AAA (7:1) preferred for body text
- All navigation operable by keyboard; sidebar and TOC navigate with Tab and arrow keys
- Skip-to-content link as the first focusable element
- Code blocks must be readable by screen readers (`role="region"`, `aria-label="code example"`)
- Icons must have text labels or `aria-label` — never icon-only navigation[^12]
- Do not use color as the sole differentiator for callout types, code syntax categories, or status indicators[^12]

***

## 12. Real-World Reference Sites

| Site | What to study |
|------|--------------|
| **[Stripe Docs](https://docs.stripe.com)** | Three-panel layout, two-column API reference, multi-language code tabs, consistency[^4] |
| **[Vercel Docs](https://vercel.com/docs)** | Cmd+K search, clean sidebar grouping, inline help-first content strategy[^12] |
| **[Tailwind CSS Docs](https://tailwindcss.com/docs)** | Exceptional search, responsive sidebar, live code examples |
| **[Mintlify Docs](https://mintlify.com/docs)** | AI-native structure, llms.txt, MCP support, modern callouts[^11] |
| **[MDN Web Docs](https://developer.mozilla.org)** | Live samples, comprehensive reference structure, strong accessibility[^16] |
| **[Linear Docs](https://linear.app/docs)** | Minimal design, fast search, exemplary tone[^7] |

***

## 13. Design Anti-Patterns to Avoid

| Anti-pattern | Why it fails |
|-------------|-------------|
| Mixing tutorial and reference on the same page | Forces users into the wrong reading mode; confuses AI chunking[^3] |
| Deep sidebar nesting (4+ levels) | Users lose orientation; mobile becomes unusable[^5] |
| Color-only status cues | Fails accessibility and dark-mode contrast requirements[^12] |
| Undated changelog / "last updated" | Destroys trust; users cannot assess whether docs reflect the current product[^4] |
| PDF-style long pages with no TOC | Users cannot scan; anchor links don't work; search snippets are meaningless |
| Heavy JavaScript for content rendering | Increases time-to-content; fails no-JS environments; hurts AI indexing[^23] |
| Vague section headings ("Overview", "Introduction") | Worthless as search results and meaningless as AI chunks[^11] |
| Inconsistent terminology | Forces readers to mentally map synonyms; breaks AI semantic matching[^4] |

***

## 14. Summary Design Principles

These ten principles distill the research into a design brief for Nue and Archie:

1. **Separate the four content types** (Tutorial, How-to, Reference, Explanation) by page and by navigation section
2. **Three-panel layout** as the default: left sidebar, content, right TOC
3. **Search is the homepage** — Cmd+K command palette with instant, hierarchical, AI-enhanced results
4. **Code is a first-class citizen** — copyable, language-labeled, themed, multi-language tabbed
5. **Dark mode is mandatory** — including correct syntax highlighting themes per mode
6. **Content-first, performance-first** — static output, no CLS, single-request page loads
7. **Design for two readers: human and LLM** — short paragraphs, canonical terms, `llms.txt`, semantic HTML
8. **Accessibility is non-negotiable** — WCAG AA minimum, keyboard navigation, no icon-only controls
9. **Consistency over creativity** — terminology, callout types, page structure, heading hierarchy
10. **Documentation is a product** — it needs maintenance, versioning, style guidelines, and usability testing[^1]

---

## References

1. [Documentation-Design-Knowledge.md](./documentation-design-knowledge.md) - *On 5/8/2026 I [asked ChatGPT 5.5 Thinking](https://chatgpt.com/c/69fe11ed-63dc-83ea-afd1-422b43aecd...

2. [Diátaxis](https://diataxis.fr) - Diátaxis identifies four distinct needs, and four corresponding forms of documentation - tutorials, ...

3. [We fixed our documentation with the Diátaxis framework](https://blog.sequinstream.com/we-fixed-our-documentation-with-the-diataxis-framework/) - The four categories of docs pages: Tutorials; How-to guides; Reference; Explanation. How I'd break t...

4. [Stripe's Developer Portal: An In-Depth Analysis](https://techwritertoolkit.wordpress.com/2023/06/12/stripes-developer-portal-an-in-depth-analysis/) - Stripe's developer portal uses a simple, easy-to-understand navigation system. The primary topics ar...

5. [Side Navigation Bar: A Complete UX Design Guide](https://uiuxdesigning.com/side-navigation-bar/) - Master the side navigation bar. This guide covers UX patterns, responsive design, accessibility, and...

6. [Best UX Practices for Designing a Sidebar](https://uxplanet.org/best-ux-practices-for-designing-a-sidebar-9174ee0ecaa2) - Enable users to expand or collapse sub-menu items for better hierarchy and cleaner navigation. Use i...

7. [Stripe Dashboard UI Here are 8 design moves ...](https://www.instagram.com/p/DScccafkeuh/) - Breaking Down Stripe Dashboard UI PART - 1 Workspace badge + name. Shows which Stripe account you're...

8. [10 Technical Documentation Best Practices for 2025](https://www.wondermentapps.com/blog/technical-documentation-best-practices/) - Use Templates to Enforce Standards: Create templates for common document types like tutorials, API r...

9. [Tips for a good search | DocSearch by Algolia](https://docsearch.algolia.com/docs/tips/) - Try to avoid orphan records such as the introduction/conclusion, or asides. The selectors must be ef...

10. [DocSearch: Search made for documentation ... - Algolia](https://docsearch.algolia.com) - Leveraging Algolia Ask AI, DocSearch interprets natural-language queries, suggests synonyms, and ran...

11. [AI Documentation Trends: What's Changing in 2025](https://www.mintlify.com/blog/ai-documentation-trends-whats-changing-in-2025) - AI is fundamentally transforming how documentation is written, structured, and consumed in 2025, wit...

12. [Web Interface Guidelines](https://vercel.com/design/guidelines) - Inline help first. Prefer inline explanations; use tooltips as a last resort. · Stable skeletons. Sk...

13. [Our recommendations for creating API documentation (with ...](https://www.mintlify.com/library/our-recommendations-for-creating-api-documentation-with-examples) - This comprehensive guide provides actionable recommendations for creating API documentation that con...

14. [Improving dark mode and syntax highlighting - Cavelab](https://www.cavelab.dev/posts/dark-mode-and-syntax-highlighting/) - Having different syntax highlight for light and dark mode really improved the readability of my code...

15. [codapi: Interactive code examples](https://codapi.org) - Interactive code examples for all types of technical writing. Embed executable code snippets directl...

16. [Live samples (EmbedLiveSample) - MDN Web Docs](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Live_samples) - MDN supports displaying code blocks within the articles as live samples, so readers can see both the...

17. [Typography | U.S. Web Design System (USWDS) - Digital.gov](https://designsystem.digital.gov/components/typography/) - The style of a typeface affects its readability. In general, serif typefaces are more appropriate fo...

18. [Design for readability - Harvard's Digital Accessibility Services](https://accessibility.huit.harvard.edu/design-readability) - Use visual and semantic space. · Provide the right amount of space between lines of text. · Use clea...

19. [Look and Feel](https://www.docsy.dev/docs/content/lookandfeel/) - Dark-mode theme customization: Docsy provides extra dark-mode styling that you can selectively inclu...

20. [Transcript: Effortless Light and Dark Mode × Theme Styling](https://syntax.fm/show/810/effortless-light-and-dark-mode-theme-styling/transcript) - Discussion on using CSS theming properties like color scheme, light/dark functions, accent color, se...

21. [Adding dark mode to my website - Ryan Chandler](https://ryangjchandler.co.uk/posts/adding-dark-mode-to-my-website) - Add a couple of dark: classes in various Blade templates and it just works. The one issue I did have...

22. [Full page apps](https://docs.stripe.com/stripe-apps/patterns/full-page-apps) - Learn how to build a custom Stripe Dashboard page that provides a complete, multi-view interface for...

23. [A standards first web framework](https://nuejs.org/blog/standards-first-web-framework/) - Nue takes a new, more natural direction: it becomes a standards first web framework. The focus has a...

