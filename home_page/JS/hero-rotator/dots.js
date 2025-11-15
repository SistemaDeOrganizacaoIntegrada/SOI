// dots.js
(function (global) {
  'use strict';

  function makeDotElement(i) {
    const el = document.createElement('span');
    el.className = 'hero-dot';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-dot-index', String(i));
    el.style.cursor = 'default';
    return el;
  }


  function createDots(container, count) {
    if (!container || typeof count !== 'number' || count <= 0) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = makeDotElement(i);
      container.appendChild(d);
    }
    // prevenir flash: marcar primeira dot como ativa até que o rotator atualize o estado real
    const first = container.children[0];
    if (first) {
      first.classList.add('is-active');
      first.setAttribute('aria-current', 'true');
    }
  }

  function updateDots(container, activeIndex) {
    if (!container) return;
    const children = Array.from(container.children);
    if (children.length === 0) return;
    const idx = (typeof activeIndex === 'number') ? ((activeIndex % children.length) + children.length) % children.length : 0;
    children.forEach((d, i) => {
      const active = i === idx;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-current', active ? 'true' : 'false');
      d.setAttribute('data-dot-index', String(i));
      // manter aria-hidden para que leitores de tela ignorem estes elementos
      d.setAttribute('aria-hidden', 'true');
    });
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Dots = { createDots, updateDots };
})(window);
