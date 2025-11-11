// home_page/JS/form.js
// Envio via Formspree usando fetch JSON
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgvreppq';

function setMessage(text, type = 'info') {
  const el = document.getElementById('form-message');
  if (!el) return;
  el.className = 'text-sm text-center pt-2';
  if (type === 'success') el.classList.add('text-green-500', 'font-medium');
  if (type === 'error') el.classList.add('text-red-500', 'font-medium');
  if (type === 'info') el.classList.add('text-gray-600');
  el.setAttribute('role', 'status');
  el.textContent = text;
}

async function sendToFormspree(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });
  return res;
}

document.addEventListener('submit', async function (e) {
  const form = e.target;
  if (!form || form.id !== 'contact-form') return;

  e.preventDefault();

  // coleta campos
  const nome = form.nome?.value?.trim() ?? '';
  const email = form.email?.value?.trim() ?? '';
  const mensagem = form.mensagem?.value?.trim() ?? '';

  // honeypot (se existir no HTML)
  const gotcha = form._gotcha ? form._gotcha.value.trim() : '';

  // validação simples no cliente
  if (gotcha) {
    // bot detectado: simplesmente aborta sem avisar usuário
    return;
  }
  if (!nome || !email || !mensagem) {
    setMessage('Por favor preencha todos os campos.', 'error');
    return;
  }
  if (!/.+@.+\..+/.test(email)) {
    setMessage('E‑mail inválido.', 'error');
    return;
  }

  setMessage('Enviando...', 'info');

  try {
    // payload: inclua nomes de campo simples; Formspree aceita JSON
    const payload = { nome, email, mensagem };
    const res = await sendToFormspree(payload);

    if (res.ok) {
      setMessage('Mensagem enviada com sucesso! A SOI entrará em contato em breve.', 'success');
      setTimeout(() => {
        form.reset();
        setMessage('', 'info');
      }, 3000);
      return;
    }

    // tenta ler corpo JSON com erro detalhado
    let errText = 'Erro ao enviar. Tente novamente mais tarde.';
    try {
      const data = await res.json();
      if (data?.error) errText = data.error;
      if (data?.errors && Array.isArray(data.errors)) {
        errText = data.errors.map(x => x.message || x).join('; ');
      }
    } catch (_) { /* ignore parse errors */ }

    setMessage(errText, 'error');
  } catch (err) {
    console.error('Erro ao enviar formulário:', err);
    setMessage('Erro de rede. Verifique sua conexão e tente novamente.', 'error');
  }
});
