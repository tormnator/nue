import { PopoverThemeManager } from 'lib/theme-manager.js';

const options = {
  selectorElementId: 'theme-menu',
  // Colors for the browser's window chrome (should match your CSS background colors):
  browserThemeColors: {
    light: '#ffffff',
    dark: '#121212',
  },
};
const themeManager = new PopoverThemeManager(options);
themeManager.initialize();

function setupPageUI() {
  themeManager.setupSelectorElement();
}

// A full page load fires DOMContentLoaded. With view transitions enabled, Nue patches the DOM
// and dispatches route after navigation instead, so both paths must initialize page controls.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPageUI, { once: true });
} else {
  setupPageUI();
}
addEventListener('route', setupPageUI);

// Delegate once from document so dialogs inserted by a Nue route update work without rebinding.
document.addEventListener('click', (event) => {
  const showButton = event.target.closest('dialog + button');
  if (!showButton) return;

  const dialog = showButton.previousElementSibling;
  if (showButton.dataset.modal === 'true') {
    dialog.showModal();
  } else {
    dialog.setAttribute('closedby', 'any');
    dialog.show();
  }
});
