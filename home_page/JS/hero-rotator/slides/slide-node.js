// slide-node.js
// slide-node.js — cria nós de slide usando classes previsíveis (hero-slide / hero-slide--visible)
(function (global) {
  'use strict';

  function createNodeFromHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    const container = document.createElement('div');
    // classe previsível para slides (substitui hero-state)
    container.className = 'hero-slide';

    const heading = temp.querySelector('h1, h2, h3, h4, h5');
    const para = temp.querySelector('p');

    if (heading) {
      const h = heading.cloneNode(true);
      // preserva estilos utilitários já usados no projeto
      h.className = 'text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight';
      container.appendChild(h);
    }

    if (para) {
      const p = para.cloneNode(true);
      p.className = 'text-xl text-gray-600 max-w-3xl mx-auto mb-10';
      container.appendChild(p);
    }

    if (!heading && !para) {
      Array.from(temp.childNodes).forEach(n => container.appendChild(n.cloneNode(true)));
    }

    return container;
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.SlidesNode = global.SOIHero.SlidesNode || {};
  global.SOIHero.SlidesNode.createNodeFromHTML = createNodeFromHTML;
})(window);