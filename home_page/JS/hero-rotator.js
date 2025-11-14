// home_page/JS/hero-rotator.js
// Rotator que carrega fragments de home_page/factored/destaques/destaqueN.html
// Usa controles estáticos em destaque.html: #hero-prev, #hero-next e .hero-dots-static
(function () {
  const WRAP_ID = 'hero-dynamic';
  const CTA_ARIA = 'Comece a digitalizar agora';
  const CTA_SELECTOR_FALLBACK = '.hero-cta';
  const DEST_BASE = 'home_page/factored/destaques/';
  const FILENAME_PREFIX = 'destaque';
  const FILENAME_SUFFIX = '.html';
  const MAX_DESTAQUES = 50;
  const INTERVAL = 5000;
  const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  let timer = null;
  let index = 0;
  let initialized = false;
  let nodes = [];
  let parentEl = null;

  function prefersReducedMotion() {
    try { return window.matchMedia && window.matchMedia(REDUCE_MOTION_QUERY).matches; } catch { return false; }
  }

  function createNodeFromHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const container = document.createElement('div');
    container.className = 'hero-state';
    // Preferir heading + paragraph
    const heading = temp.querySelector('h1, h2, h3, h4, h5');
    const para = temp.querySelector('p');

    if (heading) {
      const h = heading.cloneNode(true);
      h.className = 'text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight';
      container.appendChild(h);
    }

    if (para) {
      const p = para.cloneNode(true);
      p.className = 'text-xl text-gray-600 max-w-3xl mx-auto mb-10';
      container.appendChild(p);
    }

    if (!heading && !para) {
      Array.from(temp.childNodes).forEach(node => container.appendChild(node.cloneNode(true)));
    }

    return container;
  }

  function showSlide(i) {
    if (!nodes || nodes.length === 0) return;
    index = (i + nodes.length) % nodes.length;
    nodes.forEach((n, idx) => n.classList.toggle('is-visible', idx === index));
    updateDots();
  }

  function next() { showSlide(index + 1); restartAutoplay(); }
  function prev() { showSlide(index - 1); restartAutoplay(); }

  function createDotsStatic(container, count) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hero-dot';
      btn.setAttribute('aria-label', 'Ir para o destaque ' + (i + 1));
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => { showSlide(i); restartAutoplay(); });
      container.appendChild(btn);
    }
  }

  function updateDots() {
    if (!parentEl) return;
    const dotsWrap = parentEl.querySelector('.hero-dots-static');
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((d, idx) => {
      d.classList.toggle('is-active', idx === index);
      d.setAttribute('aria-current', idx === index ? 'true' : 'false');
    });
  }

  function startAutoplay() {
    if (prefersReducedMotion()) return;
    stopAutoplay();
    if (!nodes || nodes.length === 0) return;
    timer = setInterval(() => {
      index = (index + 1) % nodes.length;
      showSlide(index);
    }, INTERVAL);
  }

  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function attachKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!parentEl) return;
      const heroRect = parentEl.getBoundingClientRect();
      const inView = heroRect.top < window.innerHeight && heroRect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });
  }

  async function loadDestaquesSequential() {
    const loadedFragments = [];
    for (let i = 1; i <= MAX_DESTAQUES; i++) {
      const path = DEST_BASE + FILENAME_PREFIX + i + FILENAME_SUFFIX;
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) break;
        const html = await res.text();
        if (html && html.trim()) loadedFragments.push(html);
      } catch (err) {
        break;
      }
    }
    return loadedFragments;
  }

  function buildRotator(parent, fragments) {
    // preservar CTA (se existir)
    let cta = parent.querySelector(`a[aria-label="${CTA_ARIA}"]`) || parent.querySelector(CTA_SELECTOR_FALLBACK) || null;
    let ctaWrapper = parent.querySelector('.hero-cta-fixed');
    if (!ctaWrapper) {
      ctaWrapper = document.createElement('div');
      ctaWrapper.className = 'hero-cta-fixed mt-6';
      parent.appendChild(ctaWrapper);
    }
    if (cta && !ctaWrapper.contains(cta)) {
      const clone = cta.cloneNode(true);
      clone.classList.add('hero-cta');
      ctaWrapper.innerHTML = '';
      ctaWrapper.appendChild(clone);
    }

    // criar area interna do rotator se não existir
    let rotatorInner = parent.querySelector('.hero-rotator-inner');
    if (!rotatorInner) {
      rotatorInner = document.createElement('div');
      rotatorInner.className = 'hero-rotator-inner mx-auto max-w-3xl px-4';
      parent.insertBefore(rotatorInner, ctaWrapper);
    } else {
      rotatorInner.innerHTML = '';
    }

    nodes = fragments.map(f => createNodeFromHTML(f));
    if (!nodes.length) return [];
    nodes.forEach(n => rotatorInner.appendChild(n));
    showSlide(0);

    // ligar aos controles estáticos (assume que destaque.html contém #hero-prev, #hero-next e .hero-dots-static)
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');
    const dotsWrap = parent.querySelector('.hero-dots-static');

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });

    if (dotsWrap) createDotsStatic(dotsWrap, nodes.length);

    // pause on hover/focus for accessibility
    parent.addEventListener('mouseenter', stopAutoplay);
    parent.addEventListener('mouseleave', startAutoplay);
    parent.addEventListener('focusin', stopAutoplay);
    parent.addEventListener('focusout', startAutoplay);

    return nodes;
  }

  async function initHeroRotator() {
    if (initialized) return;
    initialized = true;
    const parent = document.getElementById(WRAP_ID);
    if (!parent) return;
    parentEl = parent;

    const fragments = await loadDestaquesSequential();
    if (!fragments || fragments.length === 0) return;

    nodes = buildRotator(parent, fragments);
    if (nodes.length) startAutoplay();
    attachKeyboard();
  }

  // wait-for helper
  function whenExists(selector, cb, timeout = 10000, interval = 100) {
    const start = Date.now();
    (function tryNow() {
      const el = document.querySelector(selector);
      if (el) return cb(el);
      if (Date.now() - start < timeout) return setTimeout(tryNow, interval);
      return cb(null);
    })();
  }

  // expor init para partials-loader ou uso manual
  window.startHeroRotator = initHeroRotator;

  // inicializar após partials carregados ou DOM ready
  document.addEventListener('partials:loaded', () => {
    whenExists('#' + WRAP_ID, (parent) => {
      if (!parent) return;
      initHeroRotator();
    }, 7000);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      whenExists('#' + WRAP_ID, (parent) => {
        if (!parent) return;
        initHeroRotator();
      }, 7000);
    });
  } else {
    whenExists('#' + WRAP_ID, (parent) => {
      if (!parent) return;
      initHeroRotator();
    }, 7000);
  }

  // limpar autoplay ao mudar de página
  window.addEventListener('pagehide', () => { stopAutoplay(); });
})();
