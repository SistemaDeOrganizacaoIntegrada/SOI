// utils.js
(function (global) {
  'use strict';

  const Utils = {
    clampIndex(i, len) {
      if (!len) return 0;
      return ((i % len) + len) % len;
    },
    prefersReducedMotion() {
      try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
    },
    waitFor(selector, timeout = 2500) {
      return new Promise((resolve) => {
        const start = Date.now();
        (function check() {
          const el = document.querySelector(selector);
          if (el) return resolve(el);
          if (Date.now() - start >= timeout) return resolve(null);
          requestAnimationFrame(check);
        })();
      });
    }
  };

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Utils = Utils;
})(window);
