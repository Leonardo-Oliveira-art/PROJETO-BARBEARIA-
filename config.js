/* ============================================================
   CONFIGURAÇÃO DO SITE
   Edite só este arquivo pra trocar nome, textos, cores, telefone
   e a conexão com o banco (Supabase). Não precisa mexer no resto.
   ============================================================ */

const CONFIG = {
  // ---- Identidade ----
  nomeBarbearia: "Nome da Barbearia",
  slogan: "Tradição e estilo desde sempre",
  telefone: "(11) 90000-0000",
  whatsapp: "5511900000000", // só números, com DDI 55
  endereco: "Rua Exemplo, 123 — Bairro, Cidade",
  instagram: "https://instagram.com/suabarbearia",

  // ---- Cores (valores em HEX) ----
  // Paleta clássica de barbearia: preto, dourado/latão e vermelho profundo.
  cores: {
    fundo: "#161412",       // preto quente do fundo
    fundoAlt: "#1f1c18",    // seções alternadas
    texto: "#f2e9d8",       // creme, cor do texto principal
    dourado: "#c9a227",     // detalhes, bordas, ícones
    vermelho: "#8b2f2f",    // botão principal / destaque
    linha: "#3a352c"        // divisórias sutis
  },

  // ---- Serviços exibidos no site e usados no agendamento ----
  servicos: [
    { id: 1, nome: "Corte masculino", duracaoMin: 30, preco: "R$ 45" },
    { id: 2, nome: "Barba", duracaoMin: 20, preco: "R$ 30" },
    { id: 3, nome: "Corte + Barba", duracaoMin: 45, preco: "R$ 65" }
  ],

  // ---- Horário de funcionamento ----
  horario: { abre: "09:00", fecha: "19:00" },

  // ---- Senha do painel (admin.html) ----
  // Troque por uma senha sua. É uma proteção simples (não é segurança de
  // verdade — não guarde nada sigiloso pensando que só essa senha protege).
  senhaAdmin: "trocar123",

  // ---- Supabase (banco de dados na nuvem, grátis pra começar) ----
  // Preencha depois de criar o projeto em supabase.com
  // Veja o passo a passo no README.md
  supabase: {
    url: "COLE_AQUI_A_URL_DO_SEU_PROJETO_SUPABASE",
    anonKey: "COLE_AQUI_A_ANON_KEY_DO_SEU_PROJETO_SUPABASE"
  }
};
