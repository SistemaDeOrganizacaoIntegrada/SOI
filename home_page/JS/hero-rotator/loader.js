// loader.js
(function (global) {
  'use strict';
  const DEST_BASE = 'home_page/factored/destaques/';
  const PREFIX = 'destaque';
  const SUFFIX = '.html';
  const MAX = 50;

  async function loadSequential() {
    const items = [];
    for (let i = 1; i <= MAX; i++) {
      const path = DEST_BASE + PREFIX + i + SUFFIX;
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) break;
        const txt = await res.text();
        if (txt && txt.trim()) items.push(txt);
      } catch (err) {
        break;
      }
    }
    return items;
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Loader = { loadSequential };
})(window);
