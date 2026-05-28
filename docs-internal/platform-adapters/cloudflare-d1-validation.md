# Cloudflare D1 Validation Note

Working note for validating issue #28 against a real Cloudflare Pages D1 binding before npm publish.

## Goal

Validate that a Nue site built from the local `feat/cloudflare-d1-collections` branch can run on Cloudflare Pages with:

- generated `.dist/_worker.js`
- shaped `c.env`
- raw Cloudflare bindings under `c.env.platform`
- declared `c.env.models.users` backed by Cloudflare D1

Use Wrangler Direct Upload for this validation, following the same deployment path described in [Cloudflare Pages Platform Adapter](./cloudflare-pages-user-docs-draft.md#deploy-with-wrangler). npm packages are not required because the site is built locally before deployment.

## Target

Use the `spa` template first because its server routes depend only on generic model methods:

```js
get('/users', async (c) => {
  const { users } = c.env.models
  return c.json(await users.getAll())
})

get('/users/:id', async (c) => {
  const { users } = c.env.models
  const user = await users.get(c.req.param('id'))
  return user ? c.json(user) : c.json({ error: 'User not found' }, 404)
})
```

The template already declares the Cloudflare binding/table shape:

```yaml
resources:
  models:
    users:
      kind: collection
      local: server/data/users.json

platform:
  name: cloudflare-pages
  resources:
    models:
      users:
        binding: DB
        table: users
```

## D1 Schema

The current issue #28 D1 collection implementation assumes each table has `id`, `created`, and `data` columns:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created INTEGER NOT NULL,
  data TEXT NOT NULL CHECK (json_valid(data))
);
```

`created` is a JavaScript epoch-milliseconds timestamp from `Date.now()`, stored as an SQLite/D1 `INTEGER`. `data` is JSON serialized by Nue and stored as `TEXT`; D1 can query it with SQLite JSON functions such as `json_extract()`, but this is not a native JSON column type.

Optional index for list ordering:

```sql
CREATE INDEX IF NOT EXISTS users_created_idx ON users (created DESC);
```

Seed a few rows manually. `data` is the JSON payload exposed through `c.env.models.users`:

```sql
INSERT INTO users (created, data) VALUES
  (1710000003000, json('{"name":"Sarah Chen","email":"sarah.chen@example.com","country":"Singapore","role":"Product Manager","status":"active"}')),
  (1710000002000, json('{"name":"Marcus Johnson","email":"marcus.j@example.com","country":"USA","role":"Frontend Developer","status":"active"}'));
```

For JSON seed data on Windows, prefer a `.sql` file and `wrangler d1 execute --file` over a long inline `--command`; shell argument parsing can mangle quoted JSON. Keep that file outside the site root or add it to `site.skip` so it is not copied into `.dist`.

## Setup Sketch

1. Create or choose a Cloudflare Pages Direct Upload project.
2. Create a Cloudflare D1 database for validation.
3. Bind the D1 database to the Pages project with variable name `DB` for the environment being deployed.
4. Create the `users` table using the schema above.
5. Insert seed rows.
6. Build a disposable `spa` validation project locally from this branch.
7. Deploy `.dist` with Wrangler Direct Upload.
8. Validate the deployed routes.

Example project setup/build/deploy commands:

```powershell
Set-Location c:\Dev\Research\Nue\2.0-tor\cf-pages-d1-validation
nue create spa
Set-Location .\spa
nue build --clean
bunx wrangler pages deploy .dist --project-name <pages-project> --branch=d1-validation
```

Until M4a updates the template zip workflow, `nue create spa` can create a project from stale `spa.zip` content. For issue #28 validation, sync the disposable project source files from the live local template before building:

```powershell
$template = 'C:\Git\nue\packages\templates\spa'
$project = 'C:\Dev\Research\Nue\2.0-tor\cf-pages-d1-validation\spa'
Get-ChildItem $template -Recurse -File |
  Where-Object { $_.FullName -notmatch '\\.dist\\' } |
  ForEach-Object {
    $relative = $_.FullName.Substring($template.Length + 1)
    $target = Join-Path $project $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $target -Force
  }
```

If the Pages project does not exist yet, Wrangler can create it during deploy. Bind D1 after the project exists, then redeploy. For Pages Functions, D1 bindings can be configured in the Cloudflare dashboard under the Pages project settings or with a Pages Wrangler configuration file. Binding changes apply to new deployments.

When using a Pages Wrangler configuration file for this validation, keep `wrangler.jsonc` in the project root. Wrangler reads it from the project directory for `pages_build_output_dir` and D1 bindings; it is not needed inside `.dist`. Nue skips standard Wrangler config filenames by default. Validation-only helper files such as `d1-validation-seed.sql` should be listed in `site.skip` or kept outside the site root.

```yaml
site:
  skip: [d1-validation-seed.sql]
```

## Smoke Checks

Replace `<url>` with the deployment URL printed by Wrangler:

```powershell
curl.exe <url>/users
curl.exe <url>/users/1
curl.exe -i <url>/users/999999
```

Expected results:

- `/users` returns an array of D1-backed users.
- `/users/1` returns the first seeded user.
- `/users/999999` returns `404` with `{ "error": "User not found" }`.

Also verify at least one static route and one missing file-like route:

```powershell
curl.exe -i <url>/
curl.exe -i <url>/missing.txt
```

Expected results:

- `/` returns the SPA page.
- `/missing.txt` returns a static 404 rather than the SPA shell.

## Pass Criteria

- Build emits `.dist/_worker.js`.
- Cloudflare Pages serves static assets through the generated worker.
- Cloudflare Pages route dispatch reaches Nueserver routes.
- `c.env.models.users.getAll()` reads from real D1.
- `c.env.models.users.get(id)` reads from real D1 and returns `null` for missing rows.
- Missing binding or schema problems fail clearly enough to diagnose.
- No npm package publish is needed for this validation path.

## Validation Result

Completed on 2026-05-28 using Wrangler Direct Upload from the local branch.

| Item | Value |
|---|---|
| Validation project root | `C:\Dev\Research\Nue\2.0-tor\cf-pages-d1-validation\spa` |
| Pages project | `nue-d1-validation` |
| D1 database | `nue_d1_validation` |
| D1 binding | `DB` |
| Branch alias | `https://d1-validation.nue-d1-validation.pages.dev` |
| Deployment URL | `https://cb4d0ffa.nue-d1-validation.pages.dev` |

Confirmed:

- `nue build --clean` emitted `.dist/_worker.js` and `.dist/404.html`.
- D1 table `users` was created with `created INTEGER` and `data TEXT CHECK (json_valid(data))`.
- D1 seed verification returned three rows and `json_valid(data) = 1`.
- `GET /users` returned the D1-backed user array.
- `GET /users/1` returned the first seeded user.
- `GET /missing.txt` returned `404 Not Found` rather than the SPA shell.
- `GET /123` returned `200 OK` with the SPA shell.

## Follow-Ups

- Record the exact Pages project, D1 database name, branch URL, and validation results in issue #28.
- Keep full-template auth/session validation out of issue #28 unless M4 scope changes deliberately.
- Run Cloudflare Git integration validation separately after the npm `dev` package is published from `dev`.