// dots.js
(function (global) {
  'use strict';

  function makeDotElement(i) {
    const el = document.createElement('span');
    el.className = 'hero-dot';
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('data-dot-index', String(i));
    // garante aparência de não-interativo; o CSS pode sobrescrever se necessário
    el.style.cursor = 'default';
    return el;
  }

  
  function createDots(container, count) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const d = makeDotElement(i);
      container.appendChild(d);
    }
    // sinal visual imediato para evitar flash; caller pode atualizar em seguida
    const first = container.children[0];
    if (first) first.classList.add('is-active');
  }

  
  function updateDots(container, activeIndex) {
    if (!container) return;
    const children = Array.from(container.children);
    children.forEach((d, idx) => {
      const active = idx === activeIndex;
      d.classList.toggle('is-active', active);
      // manter aria-hidden para que leitores ignorem estes elementos
      d.setAttribute('aria-hidden', 'true');
      // também manter data attribute atualizado (útil pra debug)
      d.setAttribute('data-dot-index', String(idx));
    });
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Dots = { createDots, updateDots };
})(window);
