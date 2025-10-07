const focusableSelector = [
  'a[href]','area[href]','button:not([disabled])','input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])','textarea:not([disabled])','details summary','iframe','object','embed',
  '[contenteditable="true"]','[tabindex]:not([tabindex="-1"])'
].join(',');

document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;

  const mobileToggleBtn = document.querySelector('[data-mobile-menu-button]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');
  const mobileOverlay = document.querySelector('[data-mobile-overlay]');
  const mobileCloseBtn = document.querySelector('[data-mobile-menu-close]');

  let previousFocus = null;
  let focusTrapHandler = null;

  const activateFocusTrap = (container) => {
    const focusable = Array.from(container.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeydown = (event) => {
      if (event.key !== 'Tab') {
        return;
      }
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    focusTrapHandler = handleKeydown;
    container.addEventListener('keydown', focusTrapHandler);
    first.focus();
  };

  const deactivateFocusTrap = (container) => {
    if (focusTrapHandler) {
      container.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  };

  const openMobileMenu = () => {
    if (!mobileDrawer) {
      return;
    }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    mobileDrawer.classList.remove('translate-x-full');
    mobileDrawer.classList.add('translate-x-0');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileToggleBtn?.setAttribute('aria-expanded', 'true');
    htmlEl.classList.add('overflow-hidden');
    bodyEl.classList.add('overflow-hidden');
    mobileOverlay?.classList.remove('opacity-0', 'pointer-events-none');
    mobileOverlay?.classList.add('opacity-100');
    requestAnimationFrame(() => activateFocusTrap(mobileDrawer));
  };

  const closeMobileMenu = () => {
    if (!mobileDrawer) {
      return;
    }
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.classList.remove('translate-x-0');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileToggleBtn?.setAttribute('aria-expanded', 'false');
    htmlEl.classList.remove('overflow-hidden');
    bodyEl.classList.remove('overflow-hidden');
    mobileOverlay?.classList.remove('opacity-100');
    mobileOverlay?.classList.add('opacity-0', 'pointer-events-none');
    deactivateFocusTrap(mobileDrawer);
  };

  mobileToggleBtn?.addEventListener('click', () => {
    const expanded = mobileToggleBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileCloseBtn?.addEventListener('click', closeMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);

  const desktopTrigger = document.querySelector('[data-desktop-services-trigger]');
  const desktopDropdown = document.querySelector('[data-desktop-services-dropdown]');
  let dropdownTimer = null;
  let desktopDropdownOpen = false;

  const openDesktopDropdown = () => {
    if (!desktopDropdown) {
      return;
    }
    clearTimeout(dropdownTimer);
    desktopDropdown.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-2');
    desktopDropdown.classList.add('opacity-100', 'translate-y-0');
    desktopTrigger?.setAttribute('aria-expanded', 'true');
    desktopDropdownOpen = true;
  };

  const closeDesktopDropdown = () => {
    if (!desktopDropdown) {
      return;
    }
    dropdownTimer = setTimeout(() => {
      desktopDropdown.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
      desktopDropdown.classList.remove('opacity-100', 'translate-y-0');
      desktopTrigger?.setAttribute('aria-expanded', 'false');
      desktopDropdownOpen = false;
    }, 80);
  };

  if (desktopTrigger && desktopDropdown) {
    ['mouseenter', 'focus'].forEach(evt => {
      desktopTrigger.addEventListener(evt, openDesktopDropdown);
    });
    desktopTrigger.addEventListener('mouseleave', closeDesktopDropdown);
    desktopTrigger.addEventListener('blur', (event) => {
      if (!desktopDropdown.contains(event.relatedTarget)) {
        closeDesktopDropdown();
      }
    });

    desktopDropdown.addEventListener('mouseenter', openDesktopDropdown);
    desktopDropdown.addEventListener('mouseleave', closeDesktopDropdown);
    desktopDropdown.addEventListener('focusin', openDesktopDropdown);
    desktopDropdown.addEventListener('focusout', (event) => {
      if (desktopTrigger !== event.relatedTarget && !desktopDropdown.contains(event.relatedTarget)) {
        closeDesktopDropdown();
      }
    });
  }

  const togglePanel = (panel, shouldOpen) => {
    if (shouldOpen) {
      panel.classList.add('is-open');
      panel.classList.remove('opacity-0');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      panel.classList.remove('is-open');
      panel.classList.add('opacity-0');
      panel.setAttribute('aria-hidden', 'true');
    }
  };

  document.querySelectorAll('[data-accordion-root]').forEach((accordion) => {
    accordion.querySelectorAll('[data-accordion-button]').forEach((button) => {
      const panelId = button.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) {
        return;
      }
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        const nextState = !expanded;
        if (accordion.hasAttribute('data-accordion-single')) {
          accordion.querySelectorAll('[data-accordion-button]').forEach((otherButton) => {
            if (otherButton === button) {
              return;
            }
            const otherPanelId = otherButton.getAttribute('aria-controls');
            const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
            if (!otherPanel) {
              return;
            }
            otherButton.setAttribute('aria-expanded', 'false');
            togglePanel(otherPanel, false);
          });
        }
        button.setAttribute('aria-expanded', nextState ? 'true' : 'false');
        togglePanel(panel, nextState);
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const drawerVisible = mobileDrawer && !mobileDrawer.classList.contains('translate-x-full');
      if (drawerVisible) {
        closeMobileMenu();
      }
      if (desktopDropdownOpen) {
        clearTimeout(dropdownTimer);
        desktopDropdown?.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
        desktopDropdown?.classList.remove('opacity-100', 'translate-y-0');
        desktopTrigger?.setAttribute('aria-expanded', 'false');
        desktopDropdownOpen = false;
      }
    }
  });

  document.querySelectorAll('[data-auto-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
});
