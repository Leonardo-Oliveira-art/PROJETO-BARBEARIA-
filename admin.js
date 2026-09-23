document.getElementById('nomeMarcaAdmin').textContent = CONFIG.nomeBarbearia + ' — painel';

function entrar(){
  const digitada = document.getElementById('senhaInput').value;
  if(digitada === CONFIG.senhaAdmin){
    document.getElementById('login').style.display = 'none';
    document.getElementById('painelConteudo').style.display = 'block';
    carregarAgendamentos();
  } else {
    document.getElementById('loginErro').textContent = 'Senha incorreta.';
  }
}
document.getElementById('senhaInput').addEventListener('keydown', e => {
  if(e.key === 'Enter') entrar();
});

// ---------- conexão com o banco (mesma lógica do site) ----------
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

async function buscarTodos(){
  if(supa){
    const { data, error } = await supa.from('agendamentos').select('*').order('data').order('hora');
    if(error){ console.error(error); return []; }
    return data;
  }
  return localGet().sort((a,b) => (a.data + a.hora).localeCompare(b.data + b.hora));
}

async function atualizarStatus(item, novoStatus){
  if(supa){
    const { error } = await supa.from('agendamentos').update({ status: novoStatus }).eq('id', item.id);
    if(error) console.error(error);
  } else {
    const lista = localGet();
    const alvo = lista.find(a => a.id === item.id);
    if(alvo) alvo.status = novoStatus;
    localSet(lista);
  }
  carregarAgendamentos();
}

async function cancelar(item){
  if(!confirm('Cancelar este agendamento?')) return;
  if(supa){
    const { error } = await supa.from('agendamentos').delete().eq('id', item.id);
    if(error) console.error(error);
  } else {
    localSet(localGet().filter(a => a.id !== item.id));
  }
  carregarAgendamentos();
}

// ---------- render ----------
async function carregarAgendamentos(){
  const todos = await buscarTodos();
  const box = document.getElementById('listaAgendamentos');

  if(!todos.length){
    box.innerHTML = '<p class="muted">Nenhum agendamento ainda.</p>';
    return;
  }

  // agrupa por data
  const porData = {};
  todos.forEach(a => {
    porData[a.data] = porData[a.data] || [];
    porData[a.data].push(a);
  });

  box.innerHTML = '';
  Object.keys(porData).sort().forEach(data => {
    const titulo = document.createElement('div');
    titulo.className = 'dia-titulo';
    titulo.textContent = fmtDataLonga(data);
    box.appendChild(titulo);

    porData[data].forEach(a => {
      const item = document.createElement('div');
      item.className = 'item';
      item.innerHTML = `
        <div class="info">
          <b>${a.hora} — ${a.cliente_nome}</b>
          <span class="muted">${a.servico} · ${a.telefone}</span>
        </div>
        <div class="acoes">
          ${a.status !== 'confirmed' ? '<button class="confirmar">Confirmar</button>' : '<span class="muted">confirmado ✓</span>'}
          <button class="cancelar">Cancelar</button>
        </div>
      `;
      const btnConfirmar = item.querySelector('.confirmar');
      if(btnConfirmar) btnConfirmar.addEventListener('click', () => atualizarStatus(a, 'confirmed'));
      item.querySelector('.cancelar').addEventListener('click', () => cancelar(a));
      box.appendChild(item);
    });
  });
}

function fmtDataLonga(iso){
  const [y,m,d] = iso.split('-');
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${d} de ${meses[parseInt(m,10)-1]}`;
}
