// Lista de partials e seus destinos
const partials = [
  { url: 'home_page/navegacao.html', target: '#partial-navegacao' },
  { url: 'home_page/destaque.html', target: '#partial-destaque' },
  { url: 'home_page/solucao.html', target: '#partial-solucao' },
  { url: 'home_page/beneficios.html', target: '#partial-beneficios' },
  // rodapé e contato/CTA podem ser adicionados como partials se quiser externalizar
  {
    html: `<section class="bg-primary/90 py-16 sm:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">Pronto para Integrar e Crescer?</h2>
        <p class="text-xl text-teal-100 mb-8">Dê o primeiro passo rumo a uma organização digital, eficiente e sob medida.</p>
        <a href="#contato" class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl shadow-lg text-primary bg-white hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-[1.05]">Solicite uma Consulta Gratuita</a>
      </div>
    </section>`,
    target: '#partial-cta'
  },
  {
    html: `<section id="contato" class="py-16 sm:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:grid lg:grid-cols-2 lg:gap-12">
          <div class="mb-10 lg:mb-0">
            <h2 class="text-3xl font-extrabold text-secondary mb-6">Fale Conosco</h2>
            <p class="text-gray-600 mb-8">Descreva brevemente seu problema de organização. Nossa equipe entrará em contato para entender o fluxo da sua empresa e propor uma solução personalizada.</p>
            <div class="space-y-6">
              <div class="flex items-center text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26c.45.3.99.45 1.55.45s1.1-.15 1.55-.45L21 8M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8"/></svg><span>sistemadeorganizacaointegrada@gmail.com</span></div>
              <div class="flex items-center text-gray-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/></svg><span>(98) 98187-1728</span></div>
            </div>
          </div>

          <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            <form id="contact-form" class="space-y-4">
              <div><label for="nome" class="block text-sm font-medium text-gray-700 mb-1">Seu Nome/Empresa</label><input type="text" id="nome" name="nome" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-150"></div>
              <div><label for="email" class="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label><input type="email" id="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-150"></div>
              <div><label for="mensagem" class="block text-sm font-medium text-gray-700 mb-1">Mensagem (Descreva seu desafio)</label><textarea id="mensagem" name="mensagem" rows="4" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition duration-150"></textarea></div>
              <button type="submit" class="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl shadow-md text-white bg-primary hover:bg-teal-700 transition duration-300 ease-in-out">Enviar Mensagem</button>
              <p id="form-message" class="text-sm text-center pt-2"></p>
            </form>
          </div>
        </div>
      </div>
    </section>`,
    target: '#partial-contato'
  },
  {
    html: `<footer class="bg-secondary text-white py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-2xl font-extrabold text-primary mb-4">SOI</div>
        <p class="text-gray-400 text-sm">&copy; 2025 Sistema de Organização Integrada. Todos os direitos reservados.</p>
        <div class="mt-4">
          <a href="#" class="text-gray-400 hover:text-primary mx-3 text-sm">Política de Privacidade</a>
          <a href="#" class="text-gray-400 hover:text-primary mx-3 text-sm">Termos de Uso</a>
        </div>
      </div>
    </footer>`,
    target: '#partial-rodape'
  }
];

async function loadPartial(item) {
  const target = document.querySelector(item.target);
  if (!target) return;
  if (item.html) {
    target.innerHTML = item.html;
    return;
  }
  try {
    const res = await fetch(item.url, {cache: "no-store"});
    if (!res.ok) {
      target.innerHTML = '';
      return;
    }
    const text = await res.text();
    target.innerHTML = text;
  } catch (err) {
    target.innerHTML = '';
    console.error('Erro ao carregar partial:', item.url, err);
  }
}

(async function loadAllPartials() {
  for (const p of partials) {
    await loadPartial(p);
  }
})();
