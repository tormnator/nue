## Bringing in archived Docs versions

Please be aware that we sometimes have to make some changes to the archived Docs versions for them to work side-by-side with the current and other archived versions.

### Nue 2.0 Beta

To make this version work, here's what we had to do:

- This version depends on the global data manipulation script in `sites/nue/@shared/data/topics.js`. We need to ensure that the script remain backwards compatible with this version.
- `sites/nue/docs/2.0-beta/ui/docs.html`
  - Fixed incorrect comment
  - Changed absolute path in anchor tag's href attribute to be relative to the current folder.
  - Moved `topics.yaml` from a global location in `sites/nue/@shared/data` to a location local to the archived Docs version (`sites/nue/docs/2.0-beta/ui`).