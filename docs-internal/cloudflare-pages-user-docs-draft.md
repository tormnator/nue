# Cloudflare Pages Platform Adapter

> **User-facing documentation draft.** This file is written as user-facing documentation, but it lives in `docs-internal/` until the adapter is ready to publish. Promote or rewrite it into `packages/www/docs/` only after the feature scope and production-resource story are approved.

The Cloudflare Pages Platform Adapter prepares a Nue site for deployment to Cloudflare Pages. It keeps static sites static by default and generates a Pages Advanced Mode worker only when your project needs runtime behavior.

## Enable The Adapter

Add `platform: cloudflare-pages` to `site.yaml`:

```yaml
platform: cloudflare-pages
```

Then build normally:

```bash
nue build
```

## Configuration Reference

The shortest configuration selects the Cloudflare Pages adapter by name:

```yaml
platform: cloudflare-pages
```

You can also use the object form:

```yaml
platform:
  name: cloudflare-pages
```

The object form is useful when you want to configure runtime output:

```yaml
platform:
  name: cloudflare-pages
  runtime: auto
```

Supported options:

| Option | Values | Default | Description |
|---|---|---|---|
| `platform` | `cloudflare-pages` or an object | none | Selects the Platform Adapter. If omitted, Nue builds normal target-neutral output. |
| `platform.name` | `cloudflare-pages` | none | Selects the Cloudflare Pages adapter when using object form. |
| `platform.runtime` | `auto`, `always` | `auto` | Controls whether the adapter emits runtime output such as `_worker.js`. |

Runtime policies:

| Value | Behavior |
|---|---|
| `auto` | Generate `_worker.js` only when the build detects runtime features: server routes, a server proxy, or body-scoped DHTML SPA fallback routes. Static MPA builds do not get a worker. |
| `always` | Generate `_worker.js` even when no runtime feature is detected. Use this only when you intentionally need Cloudflare Pages Advanced Mode for the deployment. |

Values other than `auto` and `always` are not part of the current adapter API.

## What Is A Worker?

Cloudflare calls its server-side JavaScript runtime "Workers". A worker is a small JavaScript module that runs on Cloudflare's network when a request comes in. In a Pages project, static files can be served directly by Pages, but a worker can add request-time behavior such as API routes, proxying, authentication, or custom fallback logic.

Cloudflare Pages Advanced Mode looks for a file named `_worker.js` in the build output. When Nue generates this file, Cloudflare runs it before returning the response. The worker can handle the request itself or call `env.ASSETS.fetch(request)` to serve the uploaded static files.

This is Cloudflare product terminology. It is not a browser Web Worker and it is not a background thread inside the user's browser; it is the deployment's request handler on Cloudflare's edge runtime.

## What Gets Built

For regular static MPA sites, Nue writes the normal `.dist/` output and does not create `_worker.js` in `auto` mode.

For projects with server routes or SPA fallback routes, Nue also generates `.dist/_worker.js`. This file uses Cloudflare Pages Advanced Mode and handles the runtime behavior required by your project.

The adapter also ensures `.dist/404.html` exists. Cloudflare Pages treats a project without a top-level `404.html` as an implicit SPA and maps unknown paths back to `/`. The root 404 page disables that platform default so missing file-like paths return 404, while Nue's generated worker can still apply explicit SPA fallback for body-scoped DHTML routes.

## Request Handling

When `_worker.js` is generated, requests are handled in this order:

1. Nueserver API routes are matched and dispatched first.
2. Static files are served through Cloudflare Pages assets.
3. Extensionless 404s can fall back to an SPA shell, such as `/admin/`.
4. Other missing files return the normal static 404.

This means content-heavy MPA pages remain static, while application areas can still use server routes and SPA navigation.

## SPA Fallback

A body-scoped DHTML `index.html` acts as an SPA entry. For example, `admin/index.html` can handle routes such as `/admin/123` after deployment. Nue records these fallback entries during build and emits them into the generated worker.

Nested SPA entries are preferred before broader root fallbacks, so `/admin/123` resolves to the admin SPA shell before a root SPA fallback.

## Getting Started With Wrangler

You can validate a Cloudflare Pages deployment directly with Wrangler after you have created a Pages project and logged in with Wrangler. This is useful when you want to test the built `.dist/` output before setting up a GitHub-based deployment.

Start with the `minimal` template:

```bash
mkdir cf-pages-demo
cd cf-pages-demo
nue create minimal
cd minimal
```

The `nue create` command creates a folder named after the template. In this example, `cf-pages-demo` is the parent folder for the deployment test project, and `minimal` is the generated Nue site.

Add a `site.yaml` file:

```yaml
platform: cloudflare-pages
```

Build and deploy the static site:

```bash
nue build
bunx wrangler pages deploy .dist --branch=preview
```

The `--branch` value is your Cloudflare Pages preview branch name. Replace `preview` with whatever branch name you want to use for the deployment. If you omit `--branch`, Wrangler deploys to the Pages project's configured production branch.

If you have not specified a Pages project before, Wrangler asks whether to create a new project or use an existing project. Creating a project from this prompt creates the Cloudflare Pages project in your Cloudflare account, asks for the project name, asks for the production branch name, uploads the files from `.dist/`, and creates the deployment. You do not need to create the project in the Cloudflare dashboard first.

The project name becomes part of the Pages URL. For example, a project named `cf-pages-demo-nue` can receive URLs such as `https://cf-pages-demo-nue.pages.dev`, deployment-specific preview URLs, and branch aliases such as `https://preview.cf-pages-demo-nue.pages.dev`. The production branch name is the branch Wrangler uses when you deploy without `--branch`; it can be `production`, `main`, or any branch name you choose for that Pages project.

For a runtime check, add a small server route:

```bash
mkdir -p @shared/server
```

Create `@shared/server/index.js`:

```js
get('/api/ping', c => c.json({ ok: true }))
```

`@shared/server` is the default server folder, so no additional `server.dir` setting is needed in `site.yaml`.

Verify the route locally with preview:

```bash
nue build --clean
nue preview
```

Open `http://localhost:4040/api/ping`, or request it from another terminal:

```bash
curl http://localhost:4040/api/ping
```

The response should be:

```json
{ "ok": true }
```

Build and deploy again:

```bash
nue build --clean
bunx wrangler pages deploy .dist --branch=runtime-check
```

The build now emits `.dist/_worker.js`. After deployment, request `/api/ping` on the deployment URL that Wrangler prints. For example:

```bash
curl https://runtime-check.<project-name>.pages.dev/api/ping
```

The deployed response should also be `{ "ok": true }`.

To also validate SPA fallback behavior, replace `index.html` with a body-scoped DHTML page:

```html
<!doctype dhtml>

<body>
  <main>
    <h1>Cloudflare Pages</h1>
    <p>This page also acts as the fallback for extensionless app routes.</p>
  </main>
</body>
```

Rebuild and restart preview to check the fallback locally:

```bash
nue build --clean
nue preview
```

Extensionless paths such as `/dashboard` should return the app shell, while file-like missing paths such as `/missing.txt` should keep returning 404. Deploy again when the local check behaves as expected, then repeat both checks against the Cloudflare Pages URL. The generated root `404.html` is what keeps Cloudflare Pages from treating `/missing.txt` as an implicit SPA route.

Wrangler may create local `.wrangler` and `.wrangler/cache` folders while you work. Treat those as local deployment state for your project.

## Current Limitations

Production environment resources are not implemented yet. Local development can provide JSON-backed mock models such as `c.env.users`, but Cloudflare production needs a future adapter resource layer for users, sessions, D1, KV, and related platform services.

Native `nue push` deployment is also not implemented yet. For now, deploy built output with Wrangler or validate deployment through Cloudflare Pages GitHub integration by committing the project and configuring Pages to build with `nue build`.

Cloudflare Pages `/functions` folder output is intentionally not supported. Nue uses Pages Advanced Mode so it can keep its own Nueserver routing and SPA fallback behavior in one generated worker.