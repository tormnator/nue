# Cloudflare D1 Validation Note

Working note for validating issue #28 against a real Cloudflare Pages D1 binding before npm publish.

## Goal

Validate that a Nue site built from the local `feat/cloudflare-d1-collections` branch can run on Cloudflare Pages with:

- generated `.dist/_worker.js`
- shaped `c.env`
- raw Cloudflare bindings under `c.env.platform`
- declared `c.env.models.users` backed by Cloudflare D1

Use Wrangler Direct Upload for this validation. npm packages are not required because the site is built locally before deployment.

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
  data TEXT NOT NULL
);
```

Optional index for list ordering:

```sql
CREATE INDEX IF NOT EXISTS users_created_idx ON users (created DESC);
```

Seed a few rows manually. `data` is the JSON payload exposed through `c.env.models.users`:

```sql
INSERT INTO users (created, data) VALUES
  (strftime('%s', 'now') * 1000, '{"name":"Sarah Chen","email":"sarah.chen@example.com","country":"Singapore","role":"Product Manager","status":"active"}'),
  (strftime('%s', 'now') * 1000, '{"name":"Marcus Johnson","email":"marcus.j@example.com","country":"USA","role":"Frontend Developer","status":"active"}');
```

## Setup Sketch

1. Create or choose a Cloudflare Pages Direct Upload project.
2. Create a Cloudflare D1 database for validation.
3. Bind the D1 database to the Pages project with variable name `DB` for the environment being deployed.
4. Create the `users` table using the schema above.
5. Insert seed rows.
6. Build the `spa` template locally from this branch.
7. Deploy `.dist` with Wrangler Direct Upload.
8. Validate the deployed routes.

Example build/deploy commands from the repo checkout:

```powershell
Set-Location c:\Git\nue\packages\templates\spa
bun ../../nuekit/src/cli.js build --clean
bunx wrangler pages deploy .dist --project-name <pages-project> --branch=d1-validation
```

If the Pages project does not exist yet, Wrangler can create it during deploy. Bind D1 after the project exists, then redeploy.

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

## Follow-Ups

- Record the exact Pages project, D1 database name, branch URL, and validation results in issue #28.
- Keep full-template auth/session validation out of issue #28 unless M4 scope changes deliberately.
- Run Cloudflare Git integration validation separately after the npm `dev` package is published from `dev`.