## Nue Template Terminology

*The following was produced on 5/5/2026 in a VS Code chat with GPT-5.4 High.*

> Status: This document is the template-focused source material for the broader [Nue Vocabulary](nue-vocabulary.md) working document. Prefer `nue-vocabulary.md` for current M5 terminology decisions, especially for YAML, configuration, and data terminology beyond templates.

### **Working Agreement**

- Use *property* as the general data term in Nue.
- Use *attribute* for markup syntax on HTML or Markdown component tags.
- Use *directive* for colon-prefixed template attributes such as `:if`, `:each`, and `:is`.
- Use *context property* for any named value available during template rendering.
- Use *component property* for a context property whose source is a component attribute.
- Use *page property* for a context property specific to the current page, including front matter values and generated page values such as url, dir, and slug.
- Use *local property* for a property created inside a template or component script.
- Use *data property* for a property coming from a data source such as YAML, JSON, front matter, collections, parsed content, or generated metadata.
- Prefer *user-defined data property* over *custom property*, unless quoting existing Nue docs.
- Use *escaped expression* for normal HTML-escaped output written as `{ expr }`.
- Use *unescaped expression* for HTML output written as `{{ expr }}`.
- Use *dynamic attribute* for an HTML attribute whose value is computed from an expression.
- Use *HTML component* for a reusable custom HTML tag used in HTML or Markdown.
- Use *Markdown partial* for a reusable custom Markdown tag used in HTML or Markdown.
- Use *layout module* for a template fragment that fills a named layout slot.
- Not all templates are Nue HTML templates. In this glossary, a template can mean an HTML template using Nue template syntax or a Markdown template written in Nuemark syntax (they form a parallel template family).

### **Glossary**

*Working glossary for chats, code comments, instructions, and draft documentation.*

- **Client-side component:** An HTML component marked for rendering on the client (e.g. browser) instead of rendered as a part of a static HTML page.
- **Component attribute**: An attribute written on a component tag at the call site, in HTML or Markdown.
- **Data manipulation script**: A JavaScript or TypeScript script in the data pipeline that receives merged data, transforms it, and returns enriched data for templates.
- **Dynamic attribute**: An HTML attribute whose value is computed from a template expression. Example form: `href="{ post.url }"`
- **Escaped expression**: A template expression whose rendered output is HTML-escaped before insertion into the document. Example form: `{ title }`
- **HTML component**: A reusable template unit referenced as a custom tag in HTML or Markdown. A component can receive component properties and can also access inherited context properties. Clarification: as of May 2026, HTML components do not inherit full page/template data by default. They receive component attribute data, injected renderer helpers (e.g. the markdown() function), and local component state. This might change in the future.
- **HTML template**: A template written in HTML using Nue template syntax. "Page template", "Layout module", and "HTML component" are HTML templates types. Long form: **Nue HTML template.**
- **Layout module**: A reusable HTML template fragment that fills a named layout slot such as header, aside, pagehead, beside, or footer. Nue assembles layout modules around page content automatically.
- **Markdown page:** A page-level Markdown template.
- **Markdown partial:** A reusable Markdown template fragment included into another template or page.
- **Markdown template:** A template written in Nuemark syntax. “Markdown page” and “Markdown partial” are Markdown template types.
- **Page template**: A page-level HTML template that renders the page’s own content. It is not a reusable component and does not fill a named layout slot.
- **Property:**
    - **Component property**: A context property whose source is a component attribute. A component property is an input to the component. Not all data visible inside a component is a component property.
    - **Computed data property**: A data property added or derived by a data manipulation script. Once merged, it is also a context property.
        - **Template helper function**: A function-valued computed data property intended to be called from template expressions.
        - **Built-in template function**: A function injected by Nue itself, such as markdown(), rather than defined in project data.
    - **Context property**: Any named value available in the template context. This is the main runtime term for data visible to expressions and template scripts.
    - **Data property**: A named value coming from a data source before or as part of context construction. This includes values from YAML, JSON, front matter, collections, parsed content, and generated page metadata.
    - **Local property**: A property created inside a template or component script for local use during rendering.
    - **Page property**: A context property specific to the current page. This includes front matter values and generated page values such as url, dir, slug, title, and description when applicable.
- **Template context**: The final merged data object available while a template renders.
- **SVG template:** A template written in Nue SVG syntax containing SVG and optional embedded HTML converted to SVG during the build.
- **Template data**: All source data that Nue loads or derives for rendering. This includes YAML and JSON data, front matter, collection items, parsed page data such as headings, generated page values such as url, dir, and slug, and values produced by data scripts.
- **Template directive**: A colon-prefixed template attribute that controls rendering or behavior using special semantics:
    - *Control directive*: directives such as `:if`, `:else-if`, `:else`, `:each`, and `:is`.
    - *Event directive*: directives such as `:onclick`, `:oninput`, and similar `:on*` handlers.
    - *Data directive*: directives that pass data into a component without rendering that attribute into the DOM.
        - *Bound property directive*: a data directive of the form `:prop="expr"` or shorthand `:prop`, which creates one component property.
        - *Bind directive*: the special data directive `:bind="expr"`, which evaluates an object and flattens its properties into the child component context.
    - Note, in Nuemark tags, only *Data directive* is available, and with different semantics: `:prop="context-property"` . This allows you to pass context properties into the component, but unlike HTML tags, it does not allow you to use full JavaScript (or similar) expressions.
- **Template expression**: A JavaScript expression evaluated against the template context. If needed, the part inside the braces can be called the expression body.
- **Template syntax**: The Nue-specific additions to standard HTML, including expressions, directives, dynamic attributes, loops, conditionals, components, and event handlers.
- **Unescaped expression**: A template expression whose rendered output is inserted as HTML without escaping. Example form: `{{ markdown(excerpt) }}`
- **User-defined data property**: A data property explicitly declared by the author, usually in YAML, JSON, or front matter, rather than generated by Nue. Also see “Custom property” in Nue’s docs.

### **Usage Rules**

- Say *attribute* when discussing source markup.
- Say *property* when discussing data available at render time.
- Qualify property by origin only when that origin matters: *page property*, *component property*, *local property*, or *user-defined data property*.
- When the origin does not matter, say *context property*.
- Do not call all data visible inside a component *component properties*. A component can see inherited page and site data too.
- Do not call a *directive* an *attribute* when the Nue-specific behavior is the point being discussed. In that case, *directive* is the clearer term.

### **Examples**

- In archie-proto-v1/website/@shared/ui/components.html, the level value supplied at the call site is a component attribute there, and a component property inside the table-of-contents component.
- In archie-proto-v1/website/@shared/ui/components.html, headings is not a component property. It is an inherited context property, typically a page property derived from parsed content.
- In archie-proto-v1/website/@shared/ui/components.html, tocHeadings is a local property created by the component script.
- In archie-proto-v1/website/@shared/ui/components.html, :each and :if are template directives.
- In archie-proto-v1/website/@shared/ui/components.html, "{ segment.name }" is an escaped expression.
- In archie-proto-v1/website/blog/posts/layout.html, "{{ excerpt }}" is an unescaped expression.
- In archie-proto-v1/website/blog/posts/layout.html, the component tag uses :is as a template directive to place the component in a layout slot.

### **Preferred Short Form**

If you want the shortest usable house style, use this:

- Property = data
- Attribute = markup input syntax
- Directive = colon-prefixed template control
- Context property = any property visible at render time
- Component property = property coming from a component attribute
- Page property = property belonging to the current page
- Local property = property created inside the template or component
- Escaped expression = normal inserted value
- Unescaped expression = inserted HTML

### **Template Data Availability Matrix**

*Current behavior as of May 2026, based on nue/packages/nuekit/src/render/page.js, nue/packages/nuekit/src/render/page.js, and nue/packages/nuedom/src/dom/node.js.*

| Construct | Page/template data | Computed data properties from data scripts | Built-in template functions | Call-site attributes / props | Local script-created properties |
| --- | --- | --- | --- | --- | --- |
| Page template | Yes | Yes | Yes | Not applicable | Yes |
| Layout module | Yes | Yes | Yes | Not applicable | Yes |
| HTML component used from HTML | No, not by default | No, not by default | Only injected renderer helpers | Yes | Yes |
| HTML component used from Nuemark tag | No, not by default | No, not by default | Only injected renderer helpers | Yes | Yes |