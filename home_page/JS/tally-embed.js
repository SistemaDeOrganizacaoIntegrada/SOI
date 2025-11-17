(function () {
  const wrap = document.getElementById('tally-frame-wrap');
  const iframe = document.getElementById('tally-iframe');
  if (!wrap || !iframe) return;

  // configurações: altura mínima, máxima absoluta (px) e proporção da viewport
  const MIN_PX = 420;
  const MAX_PX = 900;
  const VIEWPORT_RATIO = 0.7; // 70% da altura da viewport

  function adjustHeight() {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    let target = Math.round(vh * VIEWPORT_RATIO);
    if (target < MIN_PX) target = MIN_PX;
    if (target > MAX_PX) target = MAX_PX;
    wrap.style.height = target + 'px';
  }

  // Ajusta ao carregar e ao redimensionar
  window.addEventListener('load', adjustHeight);
  window.addEventListener('resize', adjustHeight);
  // execução imediata caso o script seja carregado depois do DOM
  adjustHeight();
})();
