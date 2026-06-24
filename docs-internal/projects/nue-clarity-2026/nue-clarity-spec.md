# Project Nue Clarity 2026

Status: Draft for review

Last updated: 2026-06-24

## Purpose

Project Nue Clarity updates Nue's website and rewrites the documentation sub-site so Nue becomes easier to understand, evaluate, use, and extend. The documentation sub-site is the primary deliverable; the main website is included where its messaging, IA, visual direction, and content boundaries affect the docs experience.

## Main Objective

Design, implement, validate, and publish an updated Nue website with a complete documentation rewrite. The completed docs should become the single source of truth for creating Nue sites, for both human developers and AI-assisted workflows.

## Planning Model

The project is documentation-first, dogfoods Nue, follows ASCS for HTML/CSS, and treats the main site and docs site as one connected product rather than isolated surfaces.

The project plan separates four concerns:

- Specification: purpose, scope, audience, principles, source materials, decisions, and milestone intent.
- Master plan: milestone status, tasks, validation, next actions, and project tracking.
- Information architecture (IA): main-site/docs-site boundaries, navigation, page types, and content movement.
- Content rewrite: docs migration, new pages, examples, validation, and publishing.

The project should not design the full main site before the documentation foundation is understood. It should define enough main-site direction early to make the docs coherent and future-compatible.

## Audience

Primary audience:

- web developers evaluating or adopting Nue;
- designers, UX engineers, and design engineers who care about standards-based design systems;
- technical founders, agencies, and small teams building fast content-rich websites and lightweight applications;
- AI agents and human authors that need a reliable source of truth for creating Nue projects.

Secondary audience:

- contributors maintaining the Nue fork;
- educators or writers explaining standards-first web development;
- users of a future Nue documentation-site starter template.

## Scope

In scope:

- Bootstrap a side-by-side updated website from the current site, carrying forward only the pieces that should remain.
- Review the bootstrapped website against Nue Beta 3, site-structure best practices, and ASCS before larger IA and content work begins.
- Define the relationship between the main site, blog, and docs before large content migration begins.
- Rewrite the documentation sub-site from the ground up using the SotA-docs as the primary IA/page-design guides and current Nue Beta 3 behavior as the product baseline.
- Create a UX/UI direction and design system that supports the SotA-docs guidance, ASCS, the docs rewrite, and a future main-site upgrade.
- Implement representative pages before full production so the structure, design, and content model can be validated early.
- Validate locally and on Cloudflare, starting with a private preview at the end of M3 and redeploying as needed.
- Prepare the site foundation so a reusable Nue documentation-site starter template can be created in a follow-up project.

Out of scope for this project:

- A full marketing-site rewrite before the docs architecture is proven.
- A final official-domain cutover decision before the M9 publishing phase.
- Exhaustive page-by-page documentation detail before the relevant milestone starts.
- Product roadmap changes unrelated to explaining and using the existing Nue Beta 3 line.
- A dedicated source-material intake milestone; source materials belong in this spec and in the milestones that use them.
- Creating the reusable docs starter template itself.

## Principles

- Clarity first: every structural, visual, and content decision should help users understand what Nue is and how to use it.
- Docs as product: documentation should be designed, validated, and maintained as a first-class user experience, with the SotA-docs as the primary quality model.
- Dogfood Nue: the site should demonstrate Nue's own strengths through real use.
- Standards-first: HTML, CSS, JavaScript, content files, semantic structure, accessibility, and ASCS should remain visible strengths.
- Current truth over aspiration: docs should reflect current Nue Beta 3 behavior, current package names, current templates, and current deployment practices; roadmap or philosophy content should be clearly separated from operational instructions.
- Human and AI readers: the docs should be structured so people can learn and work efficiently, and AI tools can retrieve and summarize the content reliably.
- Progressive delivery: publish a private working preview early, validate repeatedly, and wait until M9 for official publication decisions.
- Reusable foundation: prepare the site for a future docs starter template, while treating the template itself as a follow-up project.

## Main Website And Docs Relationship

The main site should answer why Nue exists, who it is for, why it is different, and what it enables. It should make the central Nue concept more prominent than the current site does, while leaving task-level learning and reference material to the docs.

The docs should answer how to learn, build, configure, deploy, and reason about Nue projects. Their detailed IA, page types, navigation model, search expectations, accessibility requirements, and AI-readiness requirements should be guided by the SotA-docs rather than repeated here.

The blog should remain useful for dated announcements and essays, but some current or future blog material may become evergreen main-site pages when it explains core Nue concepts.

Current docs content should be treated as source material, not as a fixed site map. Concept pages, selected Essentials pages such as Why Nue, and useful inline explanatory material throughout the current docs are likely inputs to the upgraded main-site and docs architecture.

M4 should resolve the boundary between evaluation content and working documentation. In general, marketing, background, comparison, philosophy, and showcase material belong on the main site when they primarily help users decide whether Nue is for them; they belong in docs when they directly support learning, task completion, reference, troubleshooting, or architectural understanding.

## Documentation Versioning

Nue should use URL-based documentation versioning for the Clarity site by default. The current documentation should live at `nuejs.org/docs`, while retained older documentation can live under versioned paths such as `nuejs.org/docs/v2-beta-3`.

A long-lived branch and subdomain model should not be the default for this project. That model is useful when a whole website needs to vary by release line, but Nue's expected need is narrower: the main website should remain current while only the docs need version-specific snapshots. Publishing each docs version from a separate long-lived branch would add branch, deployment, and domain complexity, especially if the practical result is a set of docs-specific subdomains such as `v2.docs.nuejs.org`.

The first realistic archived version may be the current pre-Clarity docs site, published as an older version of the new docs experience under a path such as `nuejs.org/docs/v2-orig` or another final name. This decision should wait until the final status of the tormnator fork is known: whether it returns to the upstream repo, becomes an official new Nue product line, or takes a different name.

Versioned docs should be treated as snapshots rather than active parallel authoring surfaces. The current docs should remain the maintained source of truth. Older versions should identify their product and version status clearly, receive only critical corrections when needed, and link readers back to the current docs where appropriate.

M5 should define the version URL naming rules, version navigation requirements, canonical URL and redirect behavior, and archival content rules. M9 should validate the final routing and publication behavior before official cutover.

## Project Milestone Outline

The milestones below are intentionally concise. Each milestone should be expanded in the master plan before active work begins.

### M1: Project Setup

Create the project specification and master plan, prepare Git, and create the GitHub initiation issue.

### M2: Bootstrap Side-By-Side Website

Create a separate updated website workspace from the current site. Carry forward the overall structure, selected home/blog material, required assets, and docs folder shell, while removing stale release messaging and leaving current docs content out until the rewrite phase.

### M3: Website Foundation Review

Review the bootstrapped website before larger architecture and content changes begin. Ensure it is compliant with Nue Beta 3, uses current Nue capabilities well, and has the best available site configuration, settings, folder structure, and file structure for this stage.

Bring in site-structure best-practice notes, update current HTML and CSS to be ASCS-compliant, and leave the CSS useful for UX/UI prototyping in M6. M3 makes the starting point technically sound; later milestones may still reveal additional structural adjustments.

Validate local build behavior and deploy a private Cloudflare preview.

### M4: Main-Site Direction And Content Boundaries

Define enough future main-site architecture to support the docs work: core message, main sections, blog relationship, promotional content boundaries, and which current docs/blog material belongs outside the docs.

This is a focused information and content architecture pass, not a full main-site redesign. M3 handles technical structure and configuration; M4 handles meaning, navigation, content placement, and the boundary between the main site, blog, and docs.

### M5: Documentation Information Architecture (IA)

Design the docs structure: audiences, learning paths, page categories, navigation, URLs, page templates, cross-linking rules, examples strategy, and content quality criteria.

The output should make it clear what pages must exist before the full rewrite begins.

### M6: UX/UI Design And Design System

Research strong documentation sites, create focused prototypes, and define the visual system for the updated website and docs. The design should be ASCS-compliant, practical for large docs, and compatible with later main-site expansion.

### M7: Implement Site Foundation And Representative Pages

Implement the selected architecture and design foundation: site configuration, layouts, navigation, CSS, docs home, and a small set of representative docs pages across the main page types.

Use this milestone to validate the system before full content production.

### M8: Full Documentation Rewrite

Rewrite and reorganize the documentation using the approved IA and design system. Add missing pages, update existing material to match Nue Beta 3, include examples, and validate instructions against real projects where needed.

### M9: Official Publication And Follow-Up Planning

Prepare the updated site for official publication after the private preview cycle. Validate build, routing, content quality, responsive behavior, deployment, and the final publication path. Record follow-up requirements for a reusable documentation-site starter template.

## Resources And Source Materials

Project-specific inputs:

- Primary:
  - State-of-the-Art Documentation Website Research (SotA-docs)
    - `docs-internal/projects/nue-clarity-2026/sota-docs-site-perplexity.md` - primary IA guide.
    - `docs-internal/projects/nue-clarity-2026/sota-docs-site-gpt.md` - supplemental IA and page-design guide.
  - Archie Semantic CSS Specification (ASCS)
    - `docs-internal/local-only/ascs-spec/ascs.instructions.md` - project-local ASCS instructions; read before the ASCS spec.
    - `docs-internal/local-only/ascs-spec/ASCS.md` - ASCS spec.
- Nue documentation notes in Notion, to be edited and brought in during the milestones that need them.
- Supplemental:
  - `docs-internal/projects/nue-clarity-2026/documentation-design-knowledge.md` - source input for the SotA-docs.

Nue project inputs:

- `docs-internal/package-descriptions.md` - package docs source material
- `docs-internal/platform-adapters/cloudflare-pages-user-docs-draft.md` - Cloudflare Pages docs source material
- `docs-internal/release-details/v2-0-beta-3.md` - Beta 3 behavior and release-details source material
- `docs-internal/vision-and-strategy/nue-vision-strategy-charter-v01.md` - overall Nue direction and guidelines
- `docs-internal/spa-research.md` - SPA docs source material
- current website and docs content under the website package

## Open Questions

- Exact location and naming for the side-by-side website implementation.
- Temporary Cloudflare project/domain naming.
- How much current main-site content is kept during bootstrap versus rewritten later.
- The minimum content and validation standard required for official publication in M9.

## Relationship To The Master Plan

This specification defines what the Clarity project is and what the plan needs to contain. The master plan should track execution: milestone status, current snapshot, next actions, validation, and concise task lists.

After this specification is approved, the master plan should be expanded from the milestone outline above using the Platform Adapters master plan as the structural template.