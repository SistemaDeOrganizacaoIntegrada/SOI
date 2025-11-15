// main.js
// Hero rotator — versão atualizada: usa classes específicas (hero-slide / hero-slide--visible / hero-dot--active)
(function () {
  'use strict';

  const WRAP_ID = 'hero-dynamic';
  const DOTS_SELECTOR = '.hero-dots-static';
  const INTERVAL_MS = 5000;
  const POLL_MS = 150;

  let parentEl = null;
  let rotatorInner = null;
  let slides = [];
  let current = 0;
  let pollId = null;
  let autoplayId = null;

  const Utils = window.SOIHero && SOIHero.Utils ? SOIHero.Utils : {
    clampIndex(i, len) { if (!len) return 0; return ((i % len) + len) % len; },
    prefersReducedMotion() { try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } },
    waitFor(selector, timeout = 3000) {
      return new Promise(resolve => {
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

  function queryDotsContainer() {
    if (parentEl) {
      const inside = parentEl.querySelector(DOTS_SELECTOR);
      if (inside) return inside;
    }
    return document.querySelector(DOTS_SELECTOR);
  }

  function updateDotsVisual(dotsWrap, idx) {
    if (!dotsWrap) return;
    const children = Array.from(dotsWrap.children);
    if (!children.length) return;
    const activeIndex = (typeof idx === 'number') ? Utils.clampIndex(idx, children.length) : 0;
    children.forEach((d, i) => {
      const active = i === activeIndex;
      d.classList.toggle('hero-dot--active', active);
      d.setAttribute('aria-current', active ? 'true' : 'false');
      d.setAttribute('data-dot-index', String(i));
      d.setAttribute('aria-hidden', 'true');
      d.style.cursor = 'default';
    });
  }

  function safeUpdateDots(idx = current) {
    const dotsWrap = queryDotsContainer();
    if (!dotsWrap) return;
    if (window.SOIHero && SOIHero.Dots && typeof SOIHero.Dots.updateDots === 'function') {
      try {
        // if external dots helper exists, prefer it but assume it can accept our index
        SOIHero.Dots.updateDots(dotsWrap, idx);
        return;
      } catch (_) { /* fallback below */ }
    }
    updateDotsVisual(dotsWrap, idx);
  }

  function showSlide(i, { skipRestart = false } = {}) {
    if (!slides || !slides.length) return;
    current = Utils.clampIndex(i, slides.length);
    slides.forEach((s, idx) => {
      const active = idx === current;
      s.classList.toggle('hero-slide--visible', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    safeUpdateDots(current);
    if (!skipRestart) {
      stopAutoplay();
      if (!Utils.prefersReducedMotion()) startAutoplay();
    }
  }

  function next() { showSlide(current + 1); }
  function prev() { showSlide(current - 1); }

  function attachControls() {
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');

    if (prevBtn) prevBtn.addEventListener('click', e => { e.preventDefault(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', e => { e.preventDefault(); next(); });

    window.addEventListener('keydown', (e) => {
      if (!parentEl) return;
      const rect = parentEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    if (parentEl) {
      parentEl.addEventListener('mouseenter', () => stopAutoplay());
      parentEl.addEventListener('mouseleave', () => { if (!Utils.prefersReducedMotion()) startAutoplay(); });
      parentEl.addEventListener('focusin', () => stopAutoplay());
      parentEl.addEventListener('focusout', () => { if (!Utils.prefersReducedMotion()) startAutoplay(); });
    }
  }

  function startAutoplay() {
    stopAutoplay();
    if (Utils.prefersReducedMotion()) return;

    if (window.SOIHero && SOIHero.Autoplay && typeof SOIHero.Autoplay.start === 'function') {
      try {
        SOIHero.Autoplay.start(INTERVAL_MS, () => showSlide(current + 1, { skipRestart: true }));
        return;
      } catch (_) { /* fallback */ }
    }

    autoplayId = setInterval(() => showSlide(current + 1, { skipRestart: true }), INTERVAL_MS);
  }

  function stopAutoplay() {
    if (window.SOIHero && SOIHero.Autoplay && typeof SOIHero.Autoplay.stop === 'function') {
      try { SOIHero.Autoplay.stop(); } catch (_) { /* ignore */ }
    }
    if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
  }

  function installPollingSync() {
    if (pollId) return;
    if (Utils.prefersReducedMotion()) return;

    pollId = setInterval(() => {
      if (!parentEl) return;
      const idx = Array.from(parentEl.querySelectorAll('.hero-slide')).findIndex(n => n.classList.contains('hero-slide--visible'));
      if (idx === -1) return;
      const dotsWrap = queryDotsContainer();
      if (!dotsWrap) return;
      const activeDot = dotsWrap.querySelector('.hero-dot--active') || dotsWrap.children[0];
      const activeIdx = activeDot ? parseInt(activeDot.getAttribute('data-dot-index') || '0', 10) : null;
      if (activeIdx !== idx) safeUpdateDots(idx);
    }, POLL_MS);

    window.addEventListener('pagehide', () => {
      if (pollId) { clearInterval(pollId); pollId = null; }
    }, { once: true });
  }

  async function init() {
    parentEl = document.getElementById(WRAP_ID);
    if (!parentEl) return;

    rotatorInner = parentEl.querySelector('.hero-rotator-inner');
    if (!rotatorInner) {
      rotatorInner = document.createElement('div');
      rotatorInner.className = 'hero-rotator-inner mx-auto max-w-3xl px-4';
      const ctaFixed = parentEl.querySelector('.hero-cta-fixed');
      parentEl.insertBefore(rotatorInner, ctaFixed || null);
    }

    let fragments = [];
    if (window.SOIHero && SOIHero.Loader && typeof SOIHero.Loader.loadSequential === 'function') {
      try { fragments = await SOIHero.Loader.loadSequential(); } catch (e) { fragments = []; }
    }

    if (!fragments || !fragments.length) return;

    // Build slides using Slides API if available (Slides should create elements with class 'hero-slide')
    if (window.SOIHero && SOIHero.Slides && typeof SOIHero.Slides.buildSlides === 'function') {
      slides = SOIHero.Slides.buildSlides(rotatorInner, fragments);
    } else {
      rotatorInner.innerHTML = '';
      slides = fragments.map(html => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const container = document.createElement('div');
        // new predictable slide class
        container.className = 'hero-slide';
        const heading = temp.querySelector('h1,h2,h3,h4,h5');
        const para = temp.querySelector('p');
        if (heading) container.appendChild(heading.cloneNode(true));
        if (para) container.appendChild(para.cloneNode(true));
        rotatorInner.appendChild(container);
        return container;
      });
    }

    if (!slides.length) return;

    // ensure dots container exists and populate with predictable hero-dot elements
    const dotsWrap = await Utils.waitFor(DOTS_SELECTOR);
    if (dotsWrap) {
      if (window.SOIHero && SOIHero.Dots && typeof SOIHero.Dots.createDots === 'function') {
        try { SOIHero.Dots.createDots(dotsWrap, slides.length); } catch (_) { /* ignore and fallback */ }
      } else {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < slides.length; i++) {
          const el = document.createElement('span');
          el.className = 'hero-dot';
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('data-dot-index', String(i));
          el.style.cursor = 'default';
          dotsWrap.appendChild(el);
        }
      }
    }

    // show first slide using new class
    current = 0;
    slides.forEach((s, idx) => {
      const active = idx === 0;
      s.classList.toggle('hero-slide--visible', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    // sync dots and attach interactions
    safeUpdateDots(current);
    attachControls();
    installPollingSync();
    startAutoplay();

    // cleanup on pagehide
    window.addEventListener('pagehide', () => {
      stopAutoplay();
      if (pollId) { clearInterval(pollId); pollId = null; }
    }, { once: true });
  }

  // public entry points / events
  document.addEventListener('partials:loaded', init);
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
