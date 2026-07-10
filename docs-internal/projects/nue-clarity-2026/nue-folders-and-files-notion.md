## Nue’s Folder & File System

### Terminology

- **App -** when used below, represents any app, area, or page as sub-folders in the site.
- **Configuration** - Nue’s predefined configuration properties, located in site.yaml and app.yaml.
- **Settings** - user defined settings, a type of template data located in .yaml and .json-files. Typically used with Nue’s template syntax (e.g. `:if`).
- **Content** - user defined content, a type of template data located in .yaml and .json-files. Typically strings displayed in the UI. A.k.a. CMS-content.

### Folders & Files

- **Special folders** - Nue treats these folders different than regular folders:
    - `/@shared/` - globally available files, can be used to keep the root folder clean:
        - `data/` - for **.yaml** and **.json-files** with settings and content template-data for the build process. **.js-**files here with a pre-defined exported function signature can transform and add to content data from the other files in the folder. Other files in this folder are ignored. *Note 1:* the data given to the **.js**-file transform functions is the entire template data set available to the page being rendered, not just the data located in the `data/` folder. *Note 2:* technically you can also place a **app.yaml** file in this folder, and both its configuration and template data will be picked up. It is not recommended to do this, though. *Note 3:* **.js**-transform files can only be placed in the `data/` folder, not anywhere else.
        - `design/` - for **.css** files automatically included in client-side load. *Note:* although it’s not the intent of this folder, **.js**-files placed here are also auto-loaded in the client browser. **.yaml, .json**, **.html**, **.md**-files are ignored. Other files (e.g. **.txt**) are copied to `.dest`.
        - `server/` - server-side (backend) code. The folder is ignored for build purposes. This folder name can be reconfigured in **site.yaml**. `server/index.js` ****is the entry point for the backend code. We recommend **not** using code from `app/` and `ui/` , while using `lib/` is okay.
        - `test/` - special undocumented Nue folder in that it is being ignored. Is assumedly for test code. For Bun-based testing a folder above the website’s root might be a better choice (to show the association with Bun).
        - `ui/` - global layout and components folder:
            - **HTML-files:** all files are used during the build, but the output depends on the **DOCTYPE declaration.** See **Special files** sub-section for more.
            - **CSS-files:** automatically browser-loaded. Overlaps with the `design/` folder, but might be used when the CSS is for layout and components in the folder.
            - **Data-files (.yaml, .json):** not used when present in this folder.
            - **JavaScript-files:** automatically browser-loaded as ES modules (type="module") for browser-time use.
    - `/home/` - for files specific to the homepage (**/index.html).** Use for files which you don’t want to have global effects. Nue will not use any sub-folders underneath **/home/.**
    - `**/{app}/ui/` - same functionality as `/@shared/ui/`, but scoped to the app instead of being globally available. *Exceptions:*
        - **Data-files (.yaml, .json):** these files are picked up when in an app’s ui folder, including the special **app.yaml** (not recommended).
- **Regular folders** - Nue does **not** treat these folders special in its source code:
    - `/@shared/` - is a special folder, but these sub-folders are regular:
        - `app/` - for JavaScript executed in the client browser. To avoid confusion consider using `client-app/` instead to make this clear. Either way, the folder and its files are copied to `.dist/`, but are not auto-loaded.
        - `lib/` - regular folder; might contain files available for both **build-time** and **client-time** execution. *Note:* as of April 2026, the only build-time **.js** execution with access to `lib/` are template data transform files (**.js** files in the `data/` folder).
    - `/` - the root folder: works the same way as app folders (see below), except:
        - `@shared/` - is only used at the root level
        - `ui/` - is only used at the app level. `/ui/` is not used. For the root, use `/@shared/ui/` instead.
        - `site.yaml` - this file is only picked for global configuration when it’s located in the root folder.
    - `**/{app}/` - any folder below the root level (other than `/@shared/`) is treated as an app
        - `index.html` - the default web page for the app. Adopts `{app}/` as its relative URL.
        - `{name}.html` - additional web pages at the same level. Adopts `{app}/{name}` (without the trailing slash) as its relative URL.
        - `{any-name}.js` - is copied to `.dest` and is auto-loaded in the head of **.html** files in the folder and sub-folders.
        - `{any-name}.css` - is copied to `.dest` and is auto-loaded in the head of **.html** files in the folder and sub-folders.
        - `app.yaml` - this is the only file whose configuration data will be picked up at the app-scope. *Note:* the **app.yaml** can reside both in the app’s folder and in the app’s ui folder (using the ui folder for app.yaml is not recommended).
        - `{any-name}.yaml` and `{any-name}.json` - settings and content template data scoped to the app. Configuration data in these files will not be picked up.
        - `{any-name}.{any-other-ext}` - is copied to `.dest`, but not used by Nue.
- **Special files:**
    - `.html` - pages, layout modules, and components. All files are used during the build, but the output depends on the **DOCTYPE declaration:**
        - **<!html lib>** means the file is transformed and included in static HTML pages, and copied to `.dist`.
        - **<!dhtml lib>** means the file is intended for CSR, is transformed into a **.html.js** file, and copied to `.dist` for consumption at browser-time (CSR).
        - **<!html + dhtml>** means the file is transformed both for inclusion in the static HTML, and into **.html.js** for CSR.
        - `index.html` - default html page for a folder
    - `.md` - markdown files discovered in root and app folders are transformed to html-files and copied to `.dist`.
        - `index.md` - transformed into **index.html** as the default html page for a folder.
    - `.css` - files discovered in root, app, and the special @shared/design/ folder are either inlined into the pages head section, or copied to `.dist` and loaded from the head section.
    - `.yaml` and `.json` - contains configuration, settings, and content available as template data. Files from the root folder, the`/@shared/data/` folder, and anywhere in the app folders will be used in the build. Only `site.yaml` and `app.yaml` can be used for configuration data.
        - `site.yaml` - Nue’s reserved file for global configuration. Cannot be any other name and will not be picked up from any other folder than root. The file’s primary purpose is configuration, but it may also contain settings and content (template data). *Exception:* configuration data placed in an app.yaml in the root will also be picked up with global scope. This is not recommended though.
        - `app.yaml` - Nue’s reserved file name for app-scoped configuration. Extends or overrides configuration in `site.yaml`. No other app-scoped file will pick up configuration for this scope. The file may contain settings and content as well. The file can reside both in the app’s folder and in the app’s ui-folder (not recommended). *Note:* the file can also reside in the root folder and would have similar functionality to site.yaml, but this is not recommended.
    - `.js` - JavaScript files discovered in root, **@shared/ui,** and the app folder hierarchy are copied to `.dist` and loaded as ES modules (type="module") from the page’s head section.
        - `@shared/server/index.js` - entry point for the backend server code execution.
        - `@shared/data/*.js` - when implemented with a special signature, these **.js**-files are used for template data transforms and additions.
    - `site.html` and `layout.html` - these are not special file names, but rather Nue’s recommended convention for global and app-scoped layout modules (`layout.html` being app-scoped).
    - `404.md` or `404.html` . Custom error page (at root level)

### Tree Structure Example

*4/21/2026: the diagram below was created by AI and then manually edited and color-coded by me. 5/1/2026: updated the diagram based on current knowledge. 7/7/2026: FYI, the diagram is not complete. For CSS organization, see `css-folders-files.md`.*

```
.
├── @shared/                        # Shared design system, libraries, and server-side logic
│   ├── client-app/                 # Business logic and data models. Requires explicit imports (import_map in site.yaml)
│   │   ├── users.js                # Example
│   │   └── payments.js             # Example
│   ├── data/                       # Global data and configurations (e.g., authors.yaml, modifier scripts)
│   │   ├── authors.yaml            # Example data for authors
│   │   └── settings.js             # Example modifier script for data
│   ├── design/                     # Global CSS files
│   │   ├── base.css                # Base colors, typography, grid (`--m`, `--l`, `--xl`)
│   │   ├── components.css          # Styles for general components like `.logo` and `.toast`
│   │   ├── content.css             # Foundational styles for common HTML elements (headings, paragraphs, lists)
│   │   ├── document.css            # Styles for content-heavy documents (article layout, headings)
│   │   ├── layout.css              # Main layout for body, header, footer, and navigation
│   │   └── README.md               # Documentation on CSS Layers and design system
│   ├── lib/                        # Client-side utility libraries. Requires explicit imports (import_map in site.yaml)
│   │   └── crud.js                 # Just an example
│   ├── server/                     # Server-side API endpoints and logic
│   │   ├── index.js                # Entry point, e.g. define API routes for login, logout, lead management
│   │   └── users.json              # Example data for user models
│   ├── test/                       # Test files - ignored by build system
│   └── ui/                         # Reusable UI components
│       ├── components.html         # UI components like pretty-date, country-emoji, toast, confirm-delete
│       ├── layout.html             # Global layout modules, e.g. head, header, footer
│       ├── {name}.css              # CSS for UI components
│       └── {name}.js               # UI logic
├── admin/                          # Administrative interface for lead management and authentication
│   ├── index.html                  # Client-side logic for admin, user sessions, authentication
│   └── ui/                         # UI components specific to the admin interface
│       ├── lead.html               # Displays detailed lead information
│       ├── leads.html              # Dynamic list of leads with search, pagination, deletion
│       └── shared.html             # Reusable UI components used in admin (e.g., dialogs, helpers)
├── blog/                           # Blog functionality
│   ├── components.html             # Reusable components for blog posts (e.g., pagehead, blog-entries)
│   ├── index.md                    # Main blog index page, dynamically injects blog entries
│   └── posts/                      # Markdown files for individual blog posts
│       ├── css-beats-js.md         # Blog post advocating native CSS
│       ├── css-is-awesome.md       # Blog post on modern CSS features
│       └── ...
├── docs/                           # Documentation section
│   ├── index.md                    # Index for documentation, organizes "Design" and "Development" sections
│   ├── accessible-design.md        # Example documentation on accessible design
│   ├── color-theory.md             # Example documentation on color theory
│   ├── layout.html                 # Supports documentation navigation (TOC, anchor links)
│   └── ...
├── home/                           # Configuration and content for the home page (index.html/.md)
│   ├── home.css                    # Styles for the home page
│   └── home.yaml                   # Data specific to the home page
├── 404.html                        # Custom error page
├── index.html                      # Main entry point for the application
└── site.yaml                       # Global site configuration

```

