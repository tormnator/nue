
# The UNIX of the Web
Web development became complicated. Hundreds of packages, 400MB of dependencies, hours of configuration before writing a single line of code. We forgot that it doesn't have to be this way.


## How web development should work

**Instant start** - Create `index.html` or `index.md` and you're running. No setup, no configuration, no waiting.

**Single-page apps** - Write semantic HTML with dynamic expressions. Import business logic from pure JavaScript modules. Let your design system handle presentation.

**Content sites** - Front pages, documentation, blogs, marketing pages. Write Nuemark content, add layout modules for structure, trust your design system for consistency.

**Universal hot reload** - Content, CSS, layouts, data, components, server routes, configurations. Save and watch the browser update instantly.

**Complete system** - Content sites, SPAs, server routes, backend models.

One tool, complete control. The UNIX philosophy applied to web development.

**Nue is the entire ecosystem in 1MB**


Visit [Nue website](https://nuejs.org) for comprehensive documentation.


## Migration from React/Next.js

**Less scaffolding** - From 500MB+ of node_modules to 1MB global install. From complex project setups to just `index.html` to get started.

**Pure separation** - Business logic in JS modules. Structure in HTML. Design in CSS. No more mixed concerns in components.

**Faster everything** - Builds in milliseconds. Hot reload across frontend and backend. Pages 10x smaller.

See the [migration guide](https://nuejs.org/docs/migration) for the complete story.

## About the tormnator fork of Nue

This fork began as a way to study and learn from Nue, then became an active compatibility and experimentation fork after real-world use exposed issues that needed fixes, including Windows compatibility bugs.

In April 2026, work started on making Nue 2.0 usable in real projects. That effort has led to a Nue 2.0 Beta 3 release with fixes, new features, Cloudflare-oriented deployment work, and supporting internal documentation. See the [Beta 3 release notes](https://github.com/tormnator/nue/blob/main/packages/www/docs/releases/v2-0-beta-3.md) and [Nuekit changelog](CHANGELOG.md) for details.

The current plan is to test Beta 3 in real projects, then decide whether to stop the project or continue with a Beta 4 step or a full release. A later decision will also be made about whether the work should be proposed back to the original Nue project or continue under a separate name.

Work on this fork takes place on the `dev` branch and short-lived topic branches off `dev`. A cleanup of branches is expected at some point. See the [branching policy](https://github.com/tormnator/nue/blob/main/docs-internal/branching-policy.md) for details.

June 13, 2026 - Tor Langlo
