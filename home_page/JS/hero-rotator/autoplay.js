// autoplay.js
(function (global) {
  'use strict';

  let timer = null;

  function start(intervalMs, callback) {
    stop();
    if (global.SOIHero.Utils && global.SOIHero.Utils.prefersReducedMotion && global.SOIHero.Utils.prefersReducedMotion()) return;
    if (!intervalMs || typeof callback !== 'function') return;
    timer = setInterval(callback, intervalMs);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Autoplay = { start, stop };
})(window);
