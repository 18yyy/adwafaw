const loginArea = document.getElementById('login-area');
const sessionArea = document.getElementById('session-area');
const dbBadge = document.getElementById('db-badge');
const listSection = document.getElementById('list-section');
const emptyState = document.getElementById('empty-state');
const addButton = document.getElementById('add-button');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const cancelar = document.getElementById('cancelar');
const form = document.getElementById('form-imovel');
document.getElementById('year').textContent = new Date().getFullYear();

let currentDb = null;

function getDbFromCookie() {
  const match = document.cookie.match(/(?:^|; )db=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function toggleAuthUi(db) {
  const actions = document.getElementById('actions');
  if (db) {
    loginArea.classList.add('hidden');
    sessionArea.classList.remove('hidden');
    actions.classList.remove('hidden');
    dbBadge.textContent = `Conectado: ${db}`;
  } else {
    loginArea.classList.remove('hidden');
    sessionArea.classList.add('hidden');
    actions.classList.add('hidden');
  }
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  if (currentDb) headers['x-db'] = currentDb;
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro');
  }
  return res.json();
}

function renderList(items) {
  listSection.innerHTML = '';
  if (!items || items.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  for (const item of items) {
    const cover = item.fotos && item.fotos[0] ? item.fotos[0].url : null;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img class="cover" src="${cover || 'https://picsum.photos/800/600?grayscale'}" alt="cover" />
      <div class="content">
        <div class="title">${item.endereco || 'Endereço não informado'}</div>
        <div class="meta">${item.quartos} quartos • ${item.vagasGaragem} vagas • ${item.metragem} m²</div>
        <div class="price">R$ ${Number(item.valor || 0).toLocaleString('pt-BR')}</div>
        <div class="meta">${item.observacoes || ''}</div>
        <div class="actions">
          <button class="ghost" data-id="${item._id}">Remover Imóvel</button>
        </div>
      </div>
    `;
    card.querySelector('button').addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm('Remover este imóvel?')) return;
      try {
        await api(`/api/casas/${id}`, { method: 'DELETE' });
        await loadList();
      } catch (err) {
        alert(err.message);
      }
    });
    listSection.appendChild(card);
  }
}

async function loadList() {
  if (!currentDb) return;
  try {
    const data = await api('/api/casas');
    renderList(data.items);
  } catch (err) {
    renderList([]);
  }
}

// Login handlers
loginButton.addEventListener('click', async () => {
  const pwd = passwordInput.value.trim();
  if (!pwd) return alert('Informe a Senha de Acesso');
  try {
    await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
    currentDb = pwd;
    toggleAuthUi(currentDb);
    await loadList();
    passwordInput.value = '';
  } catch (err) {
    alert(err.message);
  }
});

logoutButton.addEventListener('click', () => {
  document.cookie = 'db=; Max-Age=0; path=/';
  currentDb = null;
  toggleAuthUi(null);
  renderList([]);
});

// Modal control
addButton.addEventListener('click', () => { modal.classList.remove('hidden'); });
closeModal.addEventListener('click', () => { modal.classList.add('hidden'); });
cancelar.addEventListener('click', () => { modal.classList.add('hidden'); });

// Submit new property
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  try {
    await fetch('/api/casas', { method: 'POST', headers: currentDb ? { 'x-db': currentDb } : {}, body: formData });
    modal.classList.add('hidden');
    form.reset();
    await loadList();
  } catch (err) {
    alert('Erro ao salvar');
  }
});

// Boot
window.addEventListener('DOMContentLoaded', async () => {
  currentDb = getDbFromCookie();
  toggleAuthUi(currentDb);
  await loadList();
});

