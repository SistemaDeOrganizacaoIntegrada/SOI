// Trata o envio do form (simulação)
document.addEventListener('submit', function (e) {
  const form = e.target;
  if (form && form.id === 'contact-form') {
    e.preventDefault();
    const messageElement = document.getElementById('form-message');
    messageElement.className = 'text-sm text-center pt-2 text-green-500 font-medium';
    messageElement.textContent = 'Mensagem enviada com sucesso! A SOI entrará em contato em breve.';
    setTimeout(() => {
      form.reset();
      messageElement.textContent = '';
    }, 3000);
  }
});
