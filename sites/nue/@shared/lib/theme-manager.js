/**
   ThemeManager and its subclasses manage UX theme selection and application.

   Core behavior:
   - Sets a data attribute on the root element (document.documentElement) to indicate the desired
     theme. CSS can then apply theme-specific styles using attribute selectors.
   - Supports 'auto' mode: listens to system theme changes (prefers-color-scheme) and updates the
     effective theme accordingly.
   - Persists explicit user selection and applies it early on page load to
     reduce FOUC.

   Optional browser chrome / meta tag support (NOT enabled by default):
   - If you provide browserThemeColors, ThemeManager will manage:
     - <meta name="theme-color"> (best-effort)
     - <meta name="color-scheme">
   - This can influence the browser UI and UA form controls in some environments (e.g. mobile
     browsers, some PWAs). It often does not affect the desktop browser window/title bar.
   - As of today, Chromium-based browsers on Windows (Chrome/Edge/Comet) generally do not apply
     theme-color to the native window chrome, so treat this feature as best-effort.

   Options:
   - selectorElementId (string, default: 'theme-selector')
     The id of the UI control element (select/button/etc) used to choose the theme.
   - defaultTheme (string, default: 'auto')
     The theme used when the user has not selected one.
   - storage (Storage, default: localStorage)
     The Web Storage object used to persist the selected theme.
   - storageThemeName (string, default: 'theme')
     The key used to persist the selected theme.
   - dataThemeAttribute (string, default: 'theme')
     The data-* attribute name on <html>. For example, 'theme' produces <html data-theme="...">.
   - browserThemeColors (object | undefined)
     Optional mapping of theme name -> CSS color value used for <meta name="theme-color">.
     Common keys: 'light', 'dark', plus any custom theme names you support.
   - onUpdateToggleElement (function | undefined)
     Used by ToggleElementThemeManager to update the toggle UI when the theme changes.

   Usage:

   const themeManager = new DropDownThemeManager();
   themeManager.initialize();

   // or
   const themeManager = new ToggleElementThemeManager({
     selectorElementId: 'theme-toggler',
     // Best-effort browser UI colors; may not affect Windows desktop Chromium window chrome.
     browserThemeColors: {
       light: '#fafafb', // --gray-100
       dark: '#111827',  // --gray-900
       silver: 'silver',
     },
     onUpdateToggleElement: (element, theme) => {
       // Custom logic to update the toggle element's appearance based on the theme
     },
   });
   themeManager.initialize();
 */
export class ThemeManager {
  constructor(options = {}) {
    this.root = document.documentElement;

    // Options promoted to instance properties:
    this.selectorElementId = options.selectorElementId || 'theme-selector';
    this.defaultTheme = options.defaultTheme || 'auto';
    this.storage = options.storage || localStorage;
    this.storageThemeName = options.storageThemeName || 'theme';
    this.dataThemeAttribute = options.dataThemeAttribute || 'theme';
    this.browserThemeColors = options.browserThemeColors; // Optional: theme color mappings for browser chrome
    this.onUpdateToggleElement = options.onUpdateToggleElement;

    // Only manage theme-color meta tag if browserThemeColors is provided
    if (this.browserThemeColors) {
      // Remove all theme-color meta tags with media-query so we can control it dynamically:
      document.querySelectorAll('meta[name="theme-color"][media]').forEach((tag) => {
        tag.remove();
      });
      // Don't create the tag here - we'll create it lazily when needed in applyTheme
      this.themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    }

    // Find or create the color-scheme meta tag:
    this.colorSchemeMetaTag = document.querySelector('meta[name="color-scheme"]');
    if (!this.colorSchemeMetaTag) {
      this.colorSchemeMetaTag = document.createElement('meta');
      this.colorSchemeMetaTag.setAttribute('name', 'color-scheme');
      document.head.appendChild(this.colorSchemeMetaTag);
    }
    // Capture the original value (or default to 'light dark' which allows both):
    this.originalColorScheme = this.colorSchemeMetaTag.getAttribute('content') || 'light dark';
  }

  /** Returns the user's current system color scheme as 'light' or 'dark'. */
  getSystemColorScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /** Gets the user's saved theme preference. */
  getSavedTheme() {
    return this.storage.getItem(this.storageThemeName);
  }

  /** Gets the saved preference, or the configured default for a first-time visitor. */
  getThemePreference() {
    return this.getSavedTheme() || this.defaultTheme;
  }

  /** Resolves the selected preference to the theme currently applied to the document. */
  getEffectiveTheme(theme = this.getThemePreference()) {
    return theme === 'auto' ? this.getSystemColorScheme() : theme;
  }

  /** Ensures a <meta name="theme-color"> tag exists and sets its content. */
  setThemeColorMetaTag(themeColor) {
    if (themeColor) {
      if (!this.themeColorMetaTag) {
        this.themeColorMetaTag = document.createElement('meta');
        this.themeColorMetaTag.setAttribute('name', 'theme-color');
        document.head.appendChild(this.themeColorMetaTag);
      }
      this.themeColorMetaTag.setAttribute('content', themeColor); // <meta name="theme-color" content="...">
    }
  }

  /** Applies the effective theme while persisting the user's selected preference. */
  applyTheme(theme, updateStorage = true) {
    /** Helper function */
    const applyThemeToDocument = (colorScheme, themeColor, dataTheme) => {
      this.colorSchemeMetaTag.setAttribute('content', colorScheme); // <meta name="color-scheme" content="light|dark" or "light dark">
      this.setThemeColorMetaTag(themeColor); // <meta name="theme-color" content="...">
      this.root.dataset[this.dataThemeAttribute] = dataTheme; // <html data-theme="light|dark|silver">
    };

    const effectiveTheme = this.getEffectiveTheme(theme);
    // For color-scheme meta tag, only use 'light' or 'dark', not custom theme names.
    const colorScheme = ['light', 'dark'].includes(effectiveTheme)
      ? effectiveTheme
      : 'light';
    const themeColor = this.browserThemeColors?.[effectiveTheme];
    applyThemeToDocument(colorScheme, themeColor, effectiveTheme);

    // Store "auto" explicitly so it remains distinguishable from no preference.
    if (updateStorage) {
      this.storage.setItem(this.storageThemeName, theme);
    }
  }

  doSetupSelectorElement() {
    // To be implemented in subclasses
  }

  /** Binds the current selector element once. Client-side navigation can replace it without reloading
   * the document, so old listeners are aborted before a replacement is initialized. */
  setupSelectorElement() {
    const selectorElement = document.getElementById(this.selectorElementId);
    if (selectorElement === this.selectorElement) return;

    this.selectorAbortController?.abort();
    this.selectorElement = selectorElement;
    if (this.selectorElement) {
      this.selectorAbortController = new AbortController();
      this.doSetupSelectorElement(this.selectorAbortController.signal);
    }
  }

  /** Handles system color scheme changes. */
  enteredSystemDarkMode() {
    if (this.getThemePreference() === 'auto') {
      this.applyTheme('auto', false);
    }
    // Can be overridden by subclasses if needed
  }

  /** Initializes the document-wide theme state. Selector setup happens separately after each
   * initial load or client-side route event, because DOM updates do not fire DOMContentLoaded. */
  initialize() {
    // Apply before DOMContentLoaded to minimize a flash of the CSS default theme.
    this.applyTheme(this.getThemePreference(), false);

    // This listener belongs to the persistent document, not a route-specific selector.
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => this.enteredSystemDarkMode(e.matches));
  }
}

export class DropDownThemeManager extends ThemeManager {
  doSetupSelectorElement(signal) {
    super.doSetupSelectorElement(signal);
    this.selectorElement.value = this.getThemePreference();
    this.selectorElement.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    }, { signal });
  }
}

export class ToggleElementThemeManager extends ThemeManager {
  /** Updates the toggle element's appearance based on the current theme. */
  updateToggleElement(theme) {
    if (this.selectorElement && typeof this.onUpdateToggleElement === 'function') {
      this.onUpdateToggleElement(this.selectorElement, theme);
    }
  }

  /** Handles system color scheme changes. */
  enteredSystemDarkMode(isDarkMode) {
    super.enteredSystemDarkMode();
    // Only update the button state if we are in 'Auto' mode (and the theme has been removed from sessionStorage):
    if (!this.getSavedTheme()) {
      this.updateToggleElement(isDarkMode ? 'dark' : 'light');
    }
  }

  doSetupSelectorElement(signal) {
    super.doSetupSelectorElement(signal);
    const currentTheme = this.getEffectiveTheme();
    this.updateToggleElement(currentTheme);

    this.selectorElement.addEventListener('click', () => {
      const effectiveTheme =
        this.root.dataset[this.dataThemeAttribute] || this.getSystemColorScheme();
      const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';

      this.applyTheme(newTheme);
      this.updateToggleElement(newTheme);
    }, { signal });
  }
}

export class PopoverThemeManager extends ThemeManager {
  constructor(options = {}) {
    super(options);
    this.buttonsSelector = options.buttonsSelector || 'button[data-value]';
  }

  doSetupSelectorElement(signal) {
    super.doSetupSelectorElement(signal);
    // The selectorElement is the container (the popover div) containing the theme buttons
    if (this.selectorElement) {
      const buttons = this.selectorElement.querySelectorAll(this.buttonsSelector);

      // Helper to update the visual state of buttons
      const updateButtonState = () => {
        const currentTheme = this.getThemePreference();
        buttons.forEach((btn) => {
          const isSelected = btn.getAttribute('data-value') === currentTheme;
          // Set accessibility state which drives the styling
          btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        });
      };

      // Set initial state
      updateButtonState();

      // Update state whenever the popover is opened (syncs with external changes)
      this.selectorElement.addEventListener('toggle', (e) => {
        if (e.newState === 'open') {
          updateButtonState();
        }
      }, { signal });

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-value');
          this.applyTheme(theme);
          updateButtonState();

          // Close the popover after selection
          if (this.selectorElement.hasAttribute('popover')) {
            this.selectorElement.hidePopover();
          }
        }, { signal });
      });
    }
  }
}
