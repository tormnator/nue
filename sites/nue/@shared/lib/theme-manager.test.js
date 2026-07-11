import { describe, expect, test } from 'bun:test';

import { PopoverThemeManager, ThemeManager } from './theme-manager.js';

function createStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function createMeta(name, content) {
  const attributes = new Map([['name', name]]);
  if (content) attributes.set('content', content);

  return {
    removed: false,
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    remove() {
      this.removed = true;
    },
  };
}

function createElement(attributes = {}) {
  const attributeValues = new Map(Object.entries(attributes));
  const listeners = new Map();

  return {
    listeners,
    getAttribute(name) {
      return attributeValues.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributeValues.set(name, String(value));
    },
    hasAttribute(name) {
      return attributeValues.has(name);
    },
    addEventListener(name, listener) {
      const eventListeners = listeners.get(name) || [];
      eventListeners.push(listener);
      listeners.set(name, eventListeners);
    },
  };
}

function setupBrowser({ savedTheme, systemTheme = 'light', selectorElement = null } = {}) {
  const storage = createStorage(savedTheme ? { theme: savedTheme } : {});
  const root = { dataset: {} };
  const metas = [createMeta('color-scheme', 'light dark')];
  const mediaQuery = {
    matches: systemTheme === 'dark',
    listener: null,
    addEventListener(name, listener) {
      if (name === 'change') this.listener = listener;
    },
  };

  globalThis.localStorage = storage;
  globalThis.window = {
    matchMedia() {
      return mediaQuery;
    },
  };
  globalThis.document = {
    documentElement: root,
    head: {
      appendChild(element) {
        metas.push(element);
      },
    },
    createElement() {
      return createMeta('');
    },
    getElementById() {
      return selectorElement;
    },
    querySelector(selector) {
      const name = selector.match(/^meta\[name="([^"]+)"\]$/)?.[1];
      return metas.find((meta) => !meta.removed && meta.getAttribute('name') === name) || null;
    },
    querySelectorAll(selector) {
      if (selector === 'meta[name="theme-color"][media]') return [];
      return [];
    },
  };

  return {
    mediaQuery,
    root,
    storage,
    getMeta(name) {
      return metas.find((meta) => !meta.removed && meta.getAttribute('name') === name);
    },
  };
}

const browserThemeColors = {
  light: '#ffffff',
  dark: '#121212',
};

describe('ThemeManager preferences', () => {
  test('uses dark without storing a preference for a first-time visitor', () => {
    const browser = setupBrowser();
    const manager = new ThemeManager({ defaultTheme: 'dark', browserThemeColors });

    manager.initialize();

    expect(browser.root.dataset.theme).toBe('dark');
    expect(browser.storage.getItem('theme')).toBeNull();
    expect(browser.getMeta('color-scheme').getAttribute('content')).toBe('dark');
    expect(browser.getMeta('theme-color').getAttribute('content')).toBe('#121212');
  });

  test('restores an explicit preference on a later visit', () => {
    const browser = setupBrowser({ savedTheme: 'light', systemTheme: 'dark' });
    const manager = new ThemeManager({ defaultTheme: 'dark' });

    manager.initialize();

    expect(browser.root.dataset.theme).toBe('light');
    expect(manager.getThemePreference()).toBe('light');
  });

  test('stores System explicitly and follows later system changes', () => {
    const browser = setupBrowser({ systemTheme: 'light' });
    const manager = new ThemeManager({ defaultTheme: 'dark' });
    manager.initialize();

    manager.applyTheme('auto');

    expect(browser.storage.getItem('theme')).toBe('auto');
    expect(browser.root.dataset.theme).toBe('light');

    browser.mediaQuery.matches = true;
    browser.mediaQuery.listener({ matches: true });

    expect(browser.storage.getItem('theme')).toBe('auto');
    expect(browser.root.dataset.theme).toBe('dark');
  });

  test('restores System mode as System on a later visit', () => {
    const browser = setupBrowser({ savedTheme: 'auto', systemTheme: 'dark' });
    const manager = new ThemeManager({ defaultTheme: 'dark' });

    manager.initialize();

    expect(manager.getThemePreference()).toBe('auto');
    expect(browser.storage.getItem('theme')).toBe('auto');
    expect(browser.root.dataset.theme).toBe('dark');
  });

  test('does not follow system changes after an explicit light or dark choice', () => {
    const browser = setupBrowser({ savedTheme: 'light' });
    const manager = new ThemeManager({ defaultTheme: 'dark' });
    manager.initialize();

    browser.mediaQuery.matches = true;
    browser.mediaQuery.listener({ matches: true });

    expect(browser.root.dataset.theme).toBe('light');
    expect(browser.storage.getItem('theme')).toBe('light');
  });
});

describe('PopoverThemeManager', () => {
  test('shows the default preference and persists an explicit System selection', () => {
    const buttons = ['auto', 'light', 'dark'].map((theme) =>
      createElement({ 'data-value': theme }),
    );
    const selectorElement = createElement({ popover: '' });
    selectorElement.querySelectorAll = () => buttons;
    selectorElement.hidePopover = () => {
      selectorElement.wasHidden = true;
    };

    const browser = setupBrowser({ selectorElement, systemTheme: 'light' });
    const manager = new PopoverThemeManager({
      defaultTheme: 'dark',
      selectorElementId: 'theme-menu',
    });
    manager.initialize();
    manager.setupSelectorElement();

    expect(buttons[2].getAttribute('aria-pressed')).toBe('true');

    buttons[0].listeners.get('click')[0]();

    expect(browser.storage.getItem('theme')).toBe('auto');
    expect(browser.root.dataset.theme).toBe('light');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(selectorElement.wasHidden).toBe(true);
  });

  test('does not bind the same selector element twice', () => {
    const button = createElement({ 'data-value': 'dark' });
    const selectorElement = createElement();
    selectorElement.querySelectorAll = () => [button];
    setupBrowser({ selectorElement });

    const manager = new PopoverThemeManager({ selectorElementId: 'theme-menu' });
    manager.setupSelectorElement();
    manager.setupSelectorElement();

    expect(button.listeners.get('click')).toHaveLength(1);
    expect(selectorElement.listeners.get('toggle')).toHaveLength(1);
  });
});

test('both CSS theme implementations use dark as the no-attribute fallback', async () => {
  const paths = [
    '../design/a-tokens-themes.css',
    '../../home/hero/hero.css',
  ];

  for (const path of paths) {
    const css = await Bun.file(new URL(path, import.meta.url)).text();
    expect(css).toMatch(/\[data-theme="dark"\],\s*&:not\(\[data-theme\]\)\s*\{/);
    expect(css).not.toMatch(/\[data-theme="light"\],\s*&:not\(\[data-theme\]\)/);
  }
});