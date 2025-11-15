// case-panel.js
// Painel de case — versão atualizada: usa classes previsíveis para carrossel
(function () {
  const BUTTON_SELECTOR = '.ver-case';
  const WAIT_TIMEOUT = 5000;

  function whenExists(selector, cb, timeout = WAIT_TIMEOUT, interval = 100) {
    const start = Date.now();
    (function tryNow() {
      const el = document.querySelector(selector);
      if (el) return cb(el);
      if (Date.now() - start < timeout) return setTimeout(tryNow, interval);
      return cb(null);
    })();
  }

  whenExists('#planos', function (PLANS_SECTION) {
    if (!PLANS_SECTION) return;

    const panel = document.createElement('div');
    panel.className = 'case-panel max-w-5xl mx-auto';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="case-inner relative">
        <div class="case-header">
          <div id="case-heading-wrapper"></div>
          <button type="button" class="case-close" aria-label="Fechar case">Fechar</button>
        </div>
        <div id="case-content" class="prose"></div>
      </div>
    `;
    PLANS_SECTION.appendChild(panel);

    const CASE_CONTENT = panel.querySelector('#case-content');
    const CASE_HEADING_WRAPPER = panel.querySelector('#case-heading-wrapper');
    const CLOSE_BTN = panel.querySelector('.case-close');

    let loadedCases = {};
    let currentPath = null;
    let lastTrigger = null;
    let inflight = {};

    async function fetchCase(path) {
      if (loadedCases[path]) return loadedCases[path];
      if (inflight[path]) return inflight[path];

      const p = (async () => {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
          const html = await res.text();
          loadedCases[path] = html;
          return html;
        } catch (err) {
          console.error('Erro ao carregar case:', path, err);
          return '<div class="p-4 text-sm text-red-500">Não foi possível carregar os detalhes do case. Tente novamente mais tarde.</div>';
        } finally {
          delete inflight[path];
        }
      })();

      inflight[path] = p;
      return p;
    }

    function openPanel() {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function closePanel() {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      currentPath = null;
    }

    CLOSE_BTN.addEventListener('click', function (e) {
      e.preventDefault();
      closePanel();
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel();
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      }
    });

    // Inicializa carrosséis simples dentro do conteúdo do case
    function initCaseCarousels(container) {
      if (!container) return;
      const carousels = container.querySelectorAll('.image-carousel');

      carousels.forEach((wrap) => {
        const slides = Array.from(wrap.querySelectorAll('.carousel-slide'));
        if (!slides.length) return;

        const prevBtn = wrap.querySelector('.carousel-prev');
        const nextBtn = wrap.querySelector('.carousel-next');
        const dotsWrap = wrap.querySelector('.carousel-dots');
        const autoplay = wrap.dataset.autoplay === 'true';
        const intervalMs = parseInt(wrap.dataset.interval, 10) || 4500;

        let index = 0;
        let timer = null;

        function show(i) {
          index = (i + slides.length) % slides.length;
          slides.forEach((s, idx) => {
            const active = idx === index;
            // usa classes previsíveis em vez de is-active
            s.classList.toggle('carousel-slide--active', active);
            s.setAttribute('aria-hidden', active ? 'false' : 'true');
          });

          if (dotsWrap) {
            Array.from(dotsWrap.children).forEach((d, idx) => {
              d.classList.toggle('carousel-dot--active', idx === index);
              d.setAttribute('aria-current', idx === index ? 'true' : 'false');
            });
          }
        }

        function next() { show(index + 1); }
        function prev() { show(index - 1); }

        // criar dots se necessário (usando classes previsíveis)
        if (dotsWrap && dotsWrap.children.length === 0) {
          slides.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'carousel-dot';
            btn.title = 'Ir para imagem ' + (idx + 1);
            btn.setAttribute('aria-label', 'Ir para imagem ' + (idx + 1));
            btn.setAttribute('data-dot-index', String(idx));
            btn.addEventListener('click', () => {
              show(idx);
              restartTimer();
            });
            dotsWrap.appendChild(btn);
          });
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartTimer(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartTimer(); });

        function startTimer() {
          if (!autoplay) return;
          stopTimer();
          timer = setInterval(() => { next(); }, intervalMs);
        }

        function stopTimer() {
          if (timer) { clearInterval(timer); timer = null; }
        }

        function restartTimer() { stopTimer(); startTimer(); }

        // pause on hover/focus for accessibility
        wrap.addEventListener('mouseenter', stopTimer);
        wrap.addEventListener('mouseleave', startTimer);
        wrap.addEventListener('focusin', stopTimer);
        wrap.addEventListener('focusout', startTimer);

        // mostra primeiro slide e inicia autoplay se ativado
        show(0);
        startTimer();
      });
    }

    // listener global para botões "Ver case"
    document.addEventListener('click', function (e) {
      const btn = e.target.closest(BUTTON_SELECTOR);
      if (!btn) return;
      e.preventDefault();

      // suporte para diferentes formas de data attribute
      const path = btn.dataset.casePath || btn.dataset.casePath?.trim() || btn.getAttribute('data-case-path') || btn.getAttribute('data-casePath');
      if (!path) {
        console.warn('ver-case sem data-case-path no botão', btn);
        return;
      }

      lastTrigger = btn;

      // se já carregado e é o mesmo path, apenas abre (preserva foco)
      if (currentPath === path) {
        openPanel();
        const hd = CASE_CONTENT.querySelector('h1,h2,h3,h4');
        if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus(); }
        return;
      }

      // carrega e insere o conteúdo
      fetchCase(path).then(function (html) {
        CASE_CONTENT.innerHTML = html;

        // inicializa carrosséis se houver
        try {
          initCaseCarousels(CASE_CONTENT);
        } catch (err) {
          console.warn('Erro inicializando carrossel:', err);
        }

        // cria clone do heading para o cabeçalho e esconde o heading original
        const heading = CASE_CONTENT.querySelector('h2, h1, h3, h4');
        if (heading) {
          CASE_HEADING_WRAPPER.innerHTML = '';
          const clone = heading.cloneNode(true);
          clone.classList.add('text-xl', 'font-extrabold', 'text-secondary');
          clone.setAttribute('aria-hidden', 'false');
          CASE_HEADING_WRAPPER.appendChild(clone);

          heading.style.display = 'none';
          heading.setAttribute('aria-hidden', 'true');

          // foco no clone após a animação
          setTimeout(() => {
            clone.setAttribute('tabindex', '-1');
            clone.focus();
          }, 360);
        } else {
          CASE_HEADING_WRAPPER.innerHTML = '';
        }

        currentPath = path;
        openPanel();
      }).catch((err) => {
        console.error('Erro inesperado carregando case:', err);
        CASE_CONTENT.innerHTML = '<div class="p-4 text-sm text-red-500">Erro ao carregar o case.</div>';
        openPanel();
      });
    });

    // inicia fechado
    closePanel();
  });
})();
