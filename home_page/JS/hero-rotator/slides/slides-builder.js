// slides-builder.js
// builds slide nodes using predictable classes (hero-slide)
(function (global) {
  'use strict';

  function buildSlides(containerEl, fragments) {
    if (!containerEl) return [];

    containerEl.innerHTML = '';

    const createNode = (global.SOIHero && SOIHero.SlidesNode && SOIHero.SlidesNode.createNodeFromHTML)
      ? SOIHero.SlidesNode.createNodeFromHTML
      : function (html) {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          const container = document.createElement('div');
          // predictable slide class
          container.className = 'hero-slide';
          Array.from(temp.childNodes).forEach(n => container.appendChild(n.cloneNode(true)));
          return container;
        };

    const nodes = fragments.map(f => {
      const node = createNode(f);
      // ensure fallback nodes have the expected class
      if (node && !node.classList.contains('hero-slide')) {
        node.classList.add('hero-slide');
      }
      return node;
    });

    nodes.forEach(n => containerEl.appendChild(n));

    return nodes;
  }

  global.SOIHero = global.SOIHero || {};
  global.SOIHero.Slides = {
    buildSlides: buildSlides
  };
})(window);