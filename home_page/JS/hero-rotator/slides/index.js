// index.js — loader sequencial para o hero-rotator (compatível com defer)
(function (global) {
  'use strict';

  const SCRIPTS = [
    'home_page/JS/hero-rotator/slide-node.js',
    'home_page/JS/hero-rotator/slides-builder.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.async = false;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function init() {
    try {
      for (const p of SCRIPTS) {
        await loadScript(p);
      }
      // opcional: sinaliza que o bundle está pronto
      global.SOIHero = global.SOIHero || {};
      global.SOIHero.HeroRotatorBundleLoaded = true;
    } catch (err) {
      console.error('hero-rotator index loader error:', err);
    }
  }

  // se o documento já carregou, iniciar imediatamente; caso contrário, aguardar DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
