# CSS Folders, Files, and Layers for the Nue website

## Nue 2.0 Beta 3 CSS Files Structure

```bash
.
├── @shared/                        # Globally shared resources
│   ├── design/                     # Global CSS files
│   │   ├── base.css                # design layer: misc. tokens
│   │   ├── colors.css              # design layer: color tokens (default, dark); component layer: brand, accent
│   │   ├── content.css             # design layer: various content related styles
│   │   ├── elements.css            # design layer: various non-content related styles
│   │   ├── global-layout.css       # layout layer: body-children layout
│   │   ├── global.css              # design layer: fonts, body, box-sizing reset, and more
│   │   ├── grid.css                # layout layer: grid, flex, stack styles
│   │   └── ui.css                  # design layer: various "high-level" styles
│   └── lib/                        # Global files - opt-in (not auto-included)
│       ├── console/                # Console HTML component (used in home and blog pages)
│       │   └── console.css         # component layer: .console, @keyframes blink
│       ├── stack/                  # Nue Stack HTML component (used in home and blog pages)
│       │   └── stack.css           # component layer: .nue.stack aside, @media section
│       ├── video/                  # Video Player component
│       │   └── video.css           # component layer: .player
│       └── syntax.css              # design layer: syntax highlighting CSS, opt-in only (pre element)
├── blog/                           # Blog pages (local zone)
│   ├── perfect-web-framework/      # Blog article with specific CSS needs
│   │   └── perfect.css             # no layer specified: h2, .problem, #design, #speed, #ux
│   └── ui/                         # UI-related files common to all blog pages (local zone)
│       └── blog.css                # layout layer: .list, header, .author
├── docs/                           # Docs pages (local zone)
│   └── ui/                         # UI-related files common to all docs pages (local zone)
│       └── docs.css                # layout layer: .topics, .learn-more
└── home/                           # Files specific to the home page
    ├── assembly/                   # Assembly component - specific to the home page
    │   └── assembly.css            # component layer: .assembly, @keyframes
    ├── hero/                       # Hero component - specific to the home page
    │   └── hero.css                # component layer: h1, h2
    └── home.css                    # component layer: .cta-buttons, captions (CSS specific to the home page)
```

## Nue 2.0 Beta 4 CSS Files Structure
*This is the proposed structure to be used when the new documentation sub-site is launched.*

```bash
.
├── @shared/                        # Globally shared resources
│   ├── design/                     # Global CSS files
│   │   ├── a-tokens-themes.css     # `tokens` and `themes` layers
│   │   ├── b-reset-defaults.css    # `reset` and `defaults` layers
│   │   ├── c-layouts.css           # `layouts` layer
│   │   ├── d-paint.css             # `paint` layer
│   │   └── e-utilities-overrides.css # `utilities` and `overrides` layer
│   └── lib/                        # Global files - opt-in (not auto-included)
│       ├── console/                # Console HTML component (used in home and blog pages)
│       │   └── console.css         # `layouts` and `paint` layers
│       ├── stack/                  # Nue Stack HTML component (used in home and blog pages)
│       │   └── stack.css           # `layouts` and `paint` layers
│       ├── video/                  # Video Player component
│       │   └── video.css           # `layouts` and `paint` layers
│       └── syntax.css              # `tokens`, `themes`, `layouts` and `paint` layers: TODO: borrow from Archie-Nue
├── blog/                           # Blog pages (local zone)
│   ├── perfect-web-framework/      # Blog article with specific CSS needs
│   │   └── perfect.css             # `layouts` and `paint` layers
│   └── ui/                         # UI-related files common to all blog pages (local zone)
│       └── blog.css                # `layouts` and `paint` layers
├── docs/                           # Docs pages (local zone)
│   └── ui/                         # UI-related files common to all docs pages (local zone)
│       └── docs.css                # `layouts` and `paint` layers
└── home/                           # Files specific to the home page
    ├── assembly/                   # Assembly component - specific to the home page
    │   └── assembly.css            # `layouts` and `paint` layers
    ├── hero/                       # Hero component - specific to the home page
    │   └── hero.css                # `layouts` and `paint` layers
    └── home.css                    # `layouts` and `paint` layers
```
