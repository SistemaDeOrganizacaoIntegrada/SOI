// hero-rotator/slides/index.js  (PATCH)
(function (global) {
  'use strict';

  // caminhos absolutos (leading slash evita resolução relativa incorreta)
  const SCRIPTS = [
    '/home_page/JS/hero-rotator/slide-node.js',
    '/home_page/JS/hero-rotator/slides-builder.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;    // garante execução em ordem declarada quando possível
      s.async = false;
      s.onload = () => {
        console.log('[hero-rotator] loaded:', src);
        resolve(src);
      };
      s.onerror = (err) => {
        console.error('[hero-rotator] failed to load:', src, err);
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });
  }

  async function init() {
    try {
      for (const p of SCRIPTS) {
        await loadScript(p);
      }
      global.SOIHero = global.SOIHero || {};
      global.SOIHero.HeroRotatorBundleLoaded = true;
      console.log('[hero-rotator] bundle loaded');
    } catch (err) {
      console.error('[hero-rotator] index loader error:', err);
      // não lançar para não interromper outros scripts — main.js deve tratar ausência
    }
  }

  // iniciar imediatamente (index já é carregado via script tag)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
