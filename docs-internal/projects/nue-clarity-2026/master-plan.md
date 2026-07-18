# Project Nue Clarity - Master Plan

Last updated: 2026-06-24

## Purpose

This document is the working status and schedule plan for the Nue Clarity project. It tracks milestones, tasks, current state, validation, and next actions.

Design details, requirements, rules, terminology, source materials, and open questions belong in [Project Nue Clarity 2026](./nue-clarity-spec.md). Keep this document focused on what is planned, in progress, completed, canceled, waiting, or next.

The Milestones section should be a table with one milestone per row. The Milestones And Tasks section should be a compressed outline of milestones and tasks, allowing only a condensed description at the top of each milestone. If a milestone needs to document more details in this document, first consider if the details better fit in the specification or another project artifact. If the need is still there, add the milestone details in a subsection of the Milestone Details section, creating it if needed.

## Contents
<!-- Start Document Outline -->

* [Purpose](#purpose)
* [Contents](#contents)
* [Main Objective](#main-objective)
* [Milestones](#milestones)
* [Current Snapshot](#current-snapshot)
* [Next Actions](#next-actions)
* [Milestones And Tasks](#milestones-and-tasks)
  * [M1: Project Setup](#m1-project-setup)
  * [M2: Bootstrap Side-By-Side Website](#m2-bootstrap-side-by-side-website)
  * [M3: Website Foundation Review](#m3-website-foundation-review)
  * [M4: Main-Site Direction And Content Boundaries](#m4-main-site-direction-and-content-boundaries)
  * [M5: Documentation Information Architecture](#m5-documentation-information-architecture)
  * [M6: UX/UI Design And Design System](#m6-ux-ui-design-and-design-system)
  * [M7: Implement Site Foundation And Representative Pages](#m7-implement-site-foundation-and-representative-pages)
  * [M8: Full Documentation Rewrite](#m8-full-documentation-rewrite)
  * [M9: Official Publication And Follow-Up Planning](#m9-official-publication-and-follow-up-planning)

<!-- End Document Outline -->

## Main Objective

Design, implement, validate, and publish an updated Nue website with a complete documentation rewrite. The documentation sub-site is the primary deliverable and should become the single source of truth for creating Nue sites, for both human developers and AI-assisted workflows.

## Milestones

| Status | Milestone | Description |
|---|---|---|
| Completed | [M1: Project Setup](#m1-project-setup) | Created project specification and master plan; prepared Git; created GitHub initiation issue. |
| Completed | [M2: Bootstrap Side-By-Side Website](#m2-bootstrap-side-by-side-website) | Created a separate updated website workspace from selected current-site pieces. |
| Completed | [M3: Website Foundation Review](#m3-website-foundation-review) | Align the bootstrapped site with Nue Beta 3, site-structure best practices, ASCS, and private Cloudflare preview deployment. |
| In Progress | [M4: Main-Site Direction And Content Boundaries](#m4-main-site-direction-and-content-boundaries) | Define main-site direction and the boundary between evaluation content, blog content, and working docs. |
| Planned | [M5: Documentation Information Architecture](#m5-documentation-information-architecture) | Design docs audiences, learning paths, page types, navigation, URLs, page templates, examples strategy, and content criteria. |
| Planned | [M6: UX/UI Design And Design System](#m6-ux-ui-design-and-design-system) | Research, prototype, and define an ASCS-compliant visual system for the docs and future main-site expansion. |
| Planned | [M7: Implement Site Foundation And Representative Pages](#m7-implement-site-foundation-and-representative-pages) | Implement layouts, navigation, CSS, docs home, and representative page types before full content production. |
| Planned | [M8: Full Documentation Rewrite](#m8-full-documentation-rewrite) | Rewrite and reorganize the full docs using the approved IA and design system. |
| Planned | [M9: Official Publication And Follow-Up Planning](#m9-official-publication-and-follow-up-planning) | Prepare official publication after the private preview cycle and record docs-starter-template follow-up requirements. |

Status vocabulary:

- Planned: not started.
- In Progress: active branch or open implementation work exists.
- Waiting: blocked on a decision, external validation, or approval.
- Completed: implemented and validated enough for this plan.
- Canceled: intentionally dropped.

## Current Snapshot

Current project state:

- GitHub initiation issue: [#31 Project Nue Clarity 2026: website and documentation rewrite](https://github.com/tormnator/nue/issues/31).
- M1 is complete.
- M2 is complete.
- Initial project docs were committed and pushed on `proj/clarity-2026`.
- Side-by-side website bootstrap work was completed on `proj/clarity-m2-website-bootstrap`.
- Archived Nue 2.0-beta docs added as `.md` source files; versioning approach and naming finalized in the spec.
- M3 structure and configuration review is complete; the bootstrapped site was updated to use current Nue capabilities appropriately.
- M3 website foundation review and reorganization is complete.

Open planning questions:

- Temporary Cloudflare project/domain naming.
- ASCS/CSS alignment needed before private preview deployment.
- Minimum content and validation standard required for official publication in M9.

Validation status:

- M2 local build behavior was validated enough to support M3 review.
- M3 structure/configuration review, ASCS/CSS alignment, local build validation, archived-doc build validation is complete.
- M3 private preview validation has been postponed to a future milestone (TBD).

## Next Actions

Immediate next actions:

1. Start Milestone 4.

## Milestones And Tasks

### M1: Project Setup

This milestone establishes the project planning foundation and GitHub tracking. It should leave the project ready to start bootstrapping without burying design requirements in the master plan.

- Completed: Draft [Project Nue Clarity 2026](./nue-clarity-spec.md).
- Completed: Draft this master plan.
- Completed: Review and approve the specification and master plan.
- Completed: Run documentation checks before commit.
- Completed: Prepare Git for the implementation phase.
- Completed: Create GitHub initiation issue [#31](https://github.com/tormnator/nue/issues/31).
- Completed: Update this milestone after issue creation and project-doc validation.

### M2: Bootstrap Side-By-Side Website

This milestone creates the separate updated website starting point from selected current-site pieces. It should keep the bootstrap narrow: enough structure to start Clarity work, not a rewrite.

- Completed: Decide exact implementation location and name.
- Completed: Create side-by-side website workspace from the current website package.
- Completed: Carry forward selected site structure, home/blog material, required shared assets, and docs folder shell.
- Completed: Remove stale release messaging such as old 2.0/3.0 promotional notices.
- Completed: Leave current docs page content out until the rewrite phase, except where needed as source material.
- Completed: Validate local build behavior enough to support M3 review.

### M3: Website Foundation Review

This milestone makes the bootstrapped website technically sound before larger IA, content, and design work begins. It is about structure and configuration, not content architecture.

- Completed: Added original Nue 2.0 beta documentation as an archived version of the documentation in `sites/nue/docs/2.0-beta`.
- Completed: Review site configuration, settings, folder structure, and file structure against Nue Beta 3 and site-structure best-practice notes. CSS/design to be completed separately next.
- Completed: Update the site to use current Nue capabilities appropriately.
- Completed: Read project-local ASCS instructions and ASCS spec before HTML/CSS work.
- Completed: Review CSS/design configuration and file-organization and align with ASCS.
- Completed: Update current HTML and CSS to be ASCS-compliant.
- Completed: Leave CSS useful as input for M6 prototyping.
- Completed: Validate local build behavior.
- Completed: Validate that the archived 2.0-beta docs build correctly with the current Nue build pipeline.
- Postponed: Configure and deploy a private Cloudflare preview. This step has been postponed to a later milestone (which one is to be decided).

### M4: Main-Site Direction And Content Boundaries

This milestone defines enough main-site direction to support the docs work. It resolves meaning and content placement; M3 owns technical structure.

- Planned: Define the core main-site message for what Nue is, who it is for, why it is different, and what it enables.
- Planned: Decide how the main site, docs, and blog relate.
- Planned: Review current docs content as source material, including Concepts pages, selected Essentials pages such as Why Nue, and inline explanatory material.
- Planned: Identify content that belongs on the main site, in docs, in the blog, or outside the new site.
- Planned: Record content-boundary decisions for use in M5 and M8.

### M5: Documentation Information Architecture

This milestone designs the docs structure using the SotA-docs as the primary guide. It should produce enough architecture to know what pages and page types are required before the full rewrite begins.

- Planned: Finalize the Nue Vocabulary so that new docs can consistently use that vocabulary.
- Planned: Apply the SotA-docs to define docs audiences, learning paths, page categories, and navigation.
- Planned: Define URL structure and page-type model.
- Planned: Define page templates, cross-linking rules, examples strategy, and content quality criteria.
- Planned: Decide minimum representative pages for M7.
- Planned: Create the first page inventory for the full rewrite.

### M6: UX/UI Design And Design System

This milestone turns IA and ASCS requirements into an updated visual system. It should create enough design confidence for implementation without requiring every page to be final.

- Planned: Research strong documentation sites using the SotA-docs and selected reference sites.
- Planned: Create focused prototypes for docs pages and shared site surfaces.
- Planned: Define an ASCS-compliant design system for the updated website.
- Planned: Ensure the design supports large docs, accessibility, human readers, and AI-readable structure.
- Planned: Confirm compatibility with a later main-site expansion.

### M7: Implement Site Foundation And Representative Pages

This milestone implements the approved architecture and design foundation before full content production. Representative pages are used to validate the system.

- Planned: Implement site configuration, layouts, navigation, and CSS.
- Planned: Implement docs home.
- Planned: Implement representative docs pages across the main page types.
- Planned: Validate local build behavior and private preview deployment.
- Planned: Adjust IA/design only where implementation proves the need.

### M8: Full Documentation Rewrite

This milestone produces the complete docs content using the approved IA and design system. It should focus on accuracy, usability, examples, and validation against current Nue behavior.

- Planned: Rewrite and reorganize current docs content.
- Planned: Add missing pages identified by M5.
- Planned: Incorporate package descriptions, Cloudflare Pages docs, Beta 3 release details, SPA research, and Notion notes where relevant.
- Planned: Validate instructions and examples against real projects where needed.
- Planned: Review content for consistency with SotA-docs, current Nue behavior, ASCS, and the site design system.

### M9: Official Publication And Follow-Up Planning

This milestone prepares official publication after the private preview cycle. It should also capture follow-up requirements for a reusable docs starter template.

- Planned: Define final publication path and official-domain/cutover decision.
- Planned: Define minimum publication content and validation standard.
- Planned: Validate build, routing, content quality, responsive behavior, accessibility, and deployment.
- Planned: Publish or promote the updated site according to the chosen path.
- Planned: Record documentation-site starter template follow-up requirements.
- Planned: Update this master plan with final validation and close-out notes.