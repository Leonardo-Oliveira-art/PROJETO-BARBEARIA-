/* ============================================================
   Não precisa editar este arquivo pra trocar cor/nome/logo —
   isso tudo fica no config.js. Aqui é só a lógica do site.
   ============================================================ */

// ---------- aplica cores e textos do config.js ----------
(function aplicarConfig(){
  const root = document.documentElement.style;
  root.setProperty('--fundo', CONFIG.cores.fundo);
  root.setProperty('--fundo-alt', CONFIG.cores.fundoAlt);
  root.setProperty('--texto', CONFIG.cores.texto);
  root.setProperty('--dourado', CONFIG.cores.dourado);
  root.setProperty('--vermelho', CONFIG.cores.vermelho);
  root.setProperty('--linha', CONFIG.cores.linha);

  document.title = CONFIG.nomeBarbearia;
  document.getElementById('nomeMarca').textContent = CONFIG.nomeBarbearia;
  document.getElementById('heroTitulo').textContent = CONFIG.nomeBarbearia;
  document.getElementById('heroSlogan').textContent = CONFIG.slogan;
  document.getElementById('enderecoTexto').textContent = CONFIG.endereco;
  document.getElementById('telefoneTexto').textContent = CONFIG.telefone;
  document.querySelector('.nome-marca-footer').textContent = CONFIG.nomeBarbearia;
  document.getElementById('anoAtual').textContent = new Date().getFullYear();
  document.getElementById('linkInstagram').href = CONFIG.instagram;

  const lista = document.getElementById('listaServicos');
  lista.innerHTML = CONFIG.servicos.map(s => `
    <div class="servico-item">
      <span>${s.nome} <span class="muted">(${s.duracaoMin} min)</span></span>
      <span class="preco">${s.preco}</span>
    </div>
  `).join('');

  const selServico = document.getElementById('cliServico');
  selServico.innerHTML = CONFIG.servicos.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');

  const dataInput = document.getElementById('cliData');
  dataInput.value = new Date().toISOString().slice(0,10);
})();

// ---------- conexão com o banco ----------
// Se o Supabase ainda não foi configurado no config.js, o site funciona
// em modo local de teste (guarda os agendamentos só no seu navegador).
const supabaseConfigured = CONFIG.supabase.url && !CONFIG.supabase.url.startsWith('COLE_AQUI');
const supa = supabaseConfigured
  ? supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey)
  : null;

const LOCAL_KEY = 'barbearia_agendamentos_local';
function localGet(){
  try{ return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; }catch(e){ return []; }
}
function localSet(lista){
  try{ localStorage.setItem(LOCAL_KEY, JSON.stringify(lista)); }catch(e){}
}

async function buscarAgendamentosPorData(data){
  if(supa){
    const { data: rows, error } = await supa.from('agendamentos').select('*').eq('data', data);
    if(error){ console.error(error); return []; }
    return rows;
  }
  return localGet().filter(a => a.data === data);
}

async function buscarAgendamentosPorTelefone(telefone){
  if(supa){
    const { data: rows, error } = await supa.from('agendamentos').select('*').eq('telefone', telefone);
    if(error){ console.error(error); return []; }
    return rows;
  }
  return localGet().filter(a => a.telefone === telefone);
}

async function salvarAgendamento(registro){
  if(supa){
    const { error } = await supa.from('agendamentos').insert(registro);
    if(error){ console.error(error); return false; }
    return true;
  }
  const lista = localGet();
  lista.push({ ...registro, id: Date.now() });
  localSet(lista);
  return true;
}

// ---------- horários livres ----------
let horaEscolhida = null;

async function gerarSlots(){
  horaEscolhida = null;
  const data = document.getElementById('cliData').value;
  const servId = parseInt(document.getElementById('cliServico').value, 10);
  const servico = CONFIG.servicos.find(s => s.id === servId) || CONFIG.servicos[0];
  if(!servico || !data) return;

  const [abreH, abreM] = CONFIG.horario.abre.split(':').map(Number);
  const [fechaH, fechaM] = CONFIG.horario.fecha.split(':').map(Number);
  let cursor = abreH * 60 + abreM;
  const fim = fechaH * 60 + fechaM;

  const ocupadosRows = await buscarAgendamentosPorData(data);
  const ocupados = ocupadosRows.map(a => a.hora);

  const box = document.getElementById('cliSlots');
  box.innerHTML = '';
  let algum = false;

  while(cursor + servico.duracaoMin <= fim){
    const h = String(Math.floor(cursor/60)).padStart(2,'0');
    const m = String(cursor%60).padStart(2,'0');
    const label = `${h}:${m}`;
    const taken = ocupados.includes(label);
    const el = document.createElement('div');
    el.className = 'slot' + (taken ? ' taken' : '');
    el.textContent = label;
    if(!taken){
      el.addEventListener('click', () => {
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('chosen'));
        el.classList.add('chosen');
        horaEscolhida = label;
      });
      algum = true;
    }
    box.appendChild(el);
    cursor += servico.duracaoMin;
  }
  if(!algum) box.innerHTML = '<p class="msg">Sem horários livres nesse dia.</p>';
}

document.getElementById('cliData').addEventListener('change', gerarSlots);
document.getElementById('cliServico').addEventListener('change', gerarSlots);
gerarSlots();

async function confirmarAgendamento(){
  const nome = document.getElementById('cliNome').value.trim();
  const telefone = document.getElementById('cliTelefone').value.trim();
  const data = document.getElementById('cliData').value;
  const servId = parseInt(document.getElementById('cliServico').value, 10);
  const servico = CONFIG.servicos.find(s => s.id === servId);
  const msg = document.getElementById('agendaMsg');

  if(!nome || !telefone){ msg.textContent = 'Preencha nome e telefone.'; return; }
  if(!horaEscolhida){ msg.textContent = 'Escolha um horário disponível.'; return; }

  const ok = await salvarAgendamento({
    cliente_nome: nome,
    telefone,
    servico: servico ? servico.nome : '',
    data,
    hora: horaEscolhida,
    status: 'pending'
  });

  if(ok){
    msg.textContent = 'Agendamento enviado! Você recebe a confirmação por telefone.';
    document.getElementById('cliNome').value = '';
    document.getElementById('cliTelefone').value = '';
    gerarSlots();
  } else {
    msg.textContent = 'Não deu pra agendar agora. Tente de novo em instantes.';
  }
}

// ---------- ver status ----------
async function verStatus(){
  const telefone = document.getElementById('statusTelefone').value.trim();
  const box = document.getElementById('statusResultado');
  const meus = (await buscarAgendamentosPorTelefone(telefone))
    .sort((a,b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  if(!meus.length){
    box.innerHTML = '<p class="msg">Nenhum agendamento encontrado com esse telefone.</p>';
    return;
  }
  box.innerHTML = meus.map(a => `
    <div class="status-box">
      <div class="muted">${a.servico}</div>
      <div style="font-size:1.3rem; margin:6px 0">${fmtData(a.data)} às ${a.hora}</div>
      <span class="badge ${a.status === 'confirmed' ? 'confirmed' : 'pending'}">
        ${a.status === 'confirmed' ? 'confirmado ✓' : 'aguardando confirmação'}
      </span>
    </div>
  `).join('');
}

function fmtData(iso){
  const [y,m,d] = iso.split('-');
  return `${d}/${m}`;
}
