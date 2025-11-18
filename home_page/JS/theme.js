// theme.js
(function () {
  const STORAGE_KEY = 'soi-theme';
  const root = document.documentElement;

  function updateIconState(isDark, iconEl) {
    if (!iconEl) return;
    iconEl.classList.toggle('text-primary', !isDark);
    iconEl.classList.toggle('text-yellow-300', isDark);
  }

  function setDarkClass(enabled) {
    if (enabled) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
    }
    // try update icons if present
    updateIconState(enabled, document.getElementById('theme-icon'));
    updateIconState(enabled, document.getElementById('mobile-theme-icon'));
  }

  function getSystemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function loadPreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return getSystemPrefersDark();
  }

  function savePreference(pref) {
    if (pref === 'dark' || pref === 'light') {
      localStorage.setItem(STORAGE_KEY, pref);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // apply initial theme immediately
  const initiallyDark = loadPreference();
  setDarkClass(initiallyDark);

  // follow system changes only if user has no explicit preference
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setDarkClass(e.matches);
    });
  }

  // utility: attach handlers once toggle elements exist
  function attachWhenReady(selector, cb, timeout = 5000, interval = 100) {
    const start = Date.now();
    const tryAttach = () => {
      const el = document.querySelector(selector);
      if (el) {
        cb(el);
        return;
      }
      if (Date.now() - start < timeout) {
        setTimeout(tryAttach, interval);
      }
    };
    tryAttach();
  }

  function toggleAction() {
    const isDarkNow = root.classList.contains('dark-theme');
    const toDark = !isDarkNow;
    setDarkClass(toDark);
    savePreference(toDark ? 'dark' : 'light');
  }

  // attach to desktop toggle (if/when available)
  attachWhenReady('#theme-toggle', (btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAction();
    });
  });

  // attach to mobile toggle (if/when available)
  attachWhenReady('#mobile-theme-toggle', (btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAction();
    });
  });

})();
