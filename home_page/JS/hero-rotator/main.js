// main.js
(function () {
  'use strict';

  const WRAP_ID = 'hero-dynamic';
  const INTERVAL_MS = 5000;
  const DOTS_SELECTOR = '.hero-dots-static';

  let parentEl = null;
  let rotatorInner = null;
  let slides = [];
  let current = 0;

  function showSlide(i, { skipRestart = false } = {}) {
    if (!slides.length) return;
    current = SOIHero.Utils.clampIndex(i, slides.length);
    slides.forEach((s, idx) => {
      const active = idx === current;
      s.classList.toggle('is-visible', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    const dotsWrap = parentEl.querySelector(DOTS_SELECTOR);
    SOIHero.Dots.updateDots(dotsWrap, current);
    if (!skipRestart) {
      SOIHero.Autoplay.stop();
      SOIHero.Autoplay.start(INTERVAL_MS, () => { showSlide(current + 1, { skipRestart: true }); });
    }
  }

  function next() { showSlide(current + 1); }
  function prev() { showSlide(current - 1); }

  function attachControls() {
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });

    // keyboard arrows quando hero visível
    window.addEventListener('keydown', (e) => {
      if (!parentEl) return;
      const rect = parentEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    parentEl.addEventListener('mouseenter', () => SOIHero.Autoplay.stop());
    parentEl.addEventListener('mouseleave', () => SOIHero.Autoplay.start(INTERVAL_MS, () => { showSlide(current + 1, { skipRestart: true }); }));
    parentEl.addEventListener('focusin', () => SOIHero.Autoplay.stop());
    parentEl.addEventListener('focusout', () => SOIHero.Autoplay.start(INTERVAL_MS, () => { showSlide(current + 1, { skipRestart: true }); }));
  }

  async function init() {
    parentEl = document.getElementById(WRAP_ID);
    if (!parentEl) return;
    // insere/garante rotatorInner
    rotatorInner = parentEl.querySelector('.hero-rotator-inner');
    if (!rotatorInner) {
      rotatorInner = document.createElement('div');
      rotatorInner.className = 'hero-rotator-inner mx-auto max-w-3xl px-4';
      const ctaFixed = parentEl.querySelector('.hero-cta-fixed');
      parentEl.insertBefore(rotatorInner, ctaFixed || null);
    }

    // carrega fragments (sequencial)
    const fragments = await SOIHero.Loader.loadSequential();
    if (!fragments.length) return;

    // constrói slides
    slides = SOIHero.Slides.buildSlides(rotatorInner, fragments);

    // mostra primeiro slide (sem reiniciar autoplay ainda)
    current = 0;
    slides.forEach((s, idx) => {
      const active = idx === 0;
      s.classList.toggle('is-visible', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    // aguarda container de dots existir e popula
    const dotsWrap = await SOIHero.Utils.waitFor(DOTS_SELECTOR);
    if (dotsWrap) {
      SOIHero.Dots.createDots(dotsWrap, slides.length, (i) => { showSlide(i); });
      SOIHero.Dots.updateDots(dotsWrap, current);
    }

    attachControls();

    // inicia autoplay
    SOIHero.Autoplay.start(INTERVAL_MS, () => { showSlide(current + 1, { skipRestart: true }); });

    // cleanup on page hide
    window.addEventListener('pagehide', () => SOIHero.Autoplay.stop());
  }

  // inicializa quando partials foi carregado (se houver disparo) ou no DOMContentLoaded
  document.addEventListener('partials:loaded', init);
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
