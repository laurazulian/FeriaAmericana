// admin.js — panel de administración con login

const STORAGE_KEY = 'feria_americana_v1';
const SESSION_KEY = 'feria_admin_session';

// ── CAMBIÁ ESTA CONTRASEÑA ────────────────────
const PASSWORD = 'miferiapass123';
// ─────────────────────────────────────────────

let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let editingId = null;
let currentFilter = 'todas';
let pendingImage = null;

// ── LOGIN ─────────────────────────────────────
function checkSession() {
  if (sessionStorage.getItem(SESSION_KEY) === 'ok') {
    showPanel();
  }
}

function showPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  render();
}

document.getElementById('btnLogin').addEventListener('click', () => {
  const val = document.getElementById('passwordInput').value;
  if (val === PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'ok');
    document.getElementById('loginError').classList.add('hidden');
    showPanel();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
});

document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btnLogin').click();
});

document.getElementById('btnLogout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});

// ── Persistencia ──────────────────────────────
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ── Render ────────────────────────────────────
function render() {
  const grid = document.getElementById('catalogGrid');
  const badge = document.getElementById('countBadge');

  const filtered = currentFilter === 'todas'
    ? items
    : items.filter(i => i.estado === currentFilter);

  badge.textContent = `${filtered.length} prenda${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">👗</div>
        <strong>No hay prendas aquí todavía</strong>
        <p>Hacé clic en <strong>Agregar prenda</strong> para sumar tu primera pieza.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="card" data-id="${item.id}">
      <div class="card-img-wrap" onclick="openLightbox('${item.id}')">
        ${item.imagen
          ? `<img src="${item.imagen}" alt="${item.nombre}" />`
          : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">👗</div>`
        }
        <span class="card-status status-${item.estado}">${item.estado}</span>
      </div>
      <div class="card-body">
        <span class="card-category">${item.categoria}</span>
        <span class="card-title">${item.nombre || 'Sin nombre'}</span>
        ${item.talle ? `<span class="card-size">Talle: ${item.talle}</span>` : ''}
        ${item.nota ? `<span class="card-size" style="color:#aaa;font-style:italic">${item.nota}</span>` : ''}
        <div class="card-footer">
          <span class="card-price">$${Number(item.precio).toLocaleString('es-AR')}</span>
          <div class="card-actions">
            <button class="btn-icon" title="Editar" onclick="openEdit('${item.id}')">✏️</button>
            <button class="btn-icon danger" title="Eliminar" onclick="deleteItem('${item.id}')">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Filtros ───────────────────────────────────
document.getElementById('filterGroup').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  render();
});

// ── Modal ─────────────────────────────────────
function openModal(id = null) {
  editingId = id;
  pendingImage = null;

  const item = id ? items.find(i => i.id === id) : null;

  document.getElementById('modalTitle').textContent = id ? 'Editar prenda' : 'Nueva prenda';
  document.getElementById('fNombre').value = item?.nombre || '';
  document.getElementById('fCategoria').value = item?.categoria || 'Tops';
  document.getElementById('fTalle').value = item?.talle || '';
  document.getElementById('fPrecio').value = item?.precio || '';
  document.getElementById('fEstado').value = item?.estado || 'disponible';
  document.getElementById('fNota').value = item?.nota || '';

  const zone = document.getElementById('uploadZone');
  zone.querySelectorAll('img').forEach(el => el.remove());
  if (item?.imagen) {
    const img = document.createElement('img');
    img.src = item.imagen;
    zone.appendChild(img);
  }

  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  editingId = null;
  pendingImage = null;
}

document.getElementById('btnAdd').addEventListener('click', () => openModal());
document.getElementById('btnClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

// ── Upload imagen ─────────────────────────────
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  readImage(file);
});

uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));

uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) readImage(file);
});

function readImage(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImage = ev.target.result;
    uploadZone.querySelectorAll('img').forEach(el => el.remove());
    const img = document.createElement('img');
    img.src = pendingImage;
    uploadZone.appendChild(img);
  };
  reader.readAsDataURL(file);
}

// ── Guardar ───────────────────────────────────
document.getElementById('btnSave').addEventListener('click', () => {
  const nombre = document.getElementById('fNombre').value.trim();
  const precio = document.getElementById('fPrecio').value;

  if (!nombre) { alert('Agregá un nombre para la prenda.'); return; }
  if (precio === '') { alert('Ingresá un precio.'); return; }

  if (editingId) {
    const idx = items.findIndex(i => i.id === editingId);
    items[idx] = {
      ...items[idx],
      nombre,
      categoria: document.getElementById('fCategoria').value,
      talle: document.getElementById('fTalle').value.trim(),
      precio: Number(precio),
      estado: document.getElementById('fEstado').value,
      nota: document.getElementById('fNota').value.trim(),
      ...(pendingImage ? { imagen: pendingImage } : {})
    };
  } else {
    items.unshift({
      id: crypto.randomUUID(),
      nombre,
      categoria: document.getElementById('fCategoria').value,
      talle: document.getElementById('fTalle').value.trim(),
      precio: Number(precio),
      estado: document.getElementById('fEstado').value,
      nota: document.getElementById('fNota').value.trim(),
      imagen: pendingImage || null
    });
  }

  save();
  render();
  closeModal();
});

// ── Editar / Eliminar ─────────────────────────
function openEdit(id) { openModal(id); }

function deleteItem(id) {
  if (!confirm('¿Eliminar esta prenda?')) return;
  items = items.filter(i => i.id !== id);
  save();
  render();
}

// ── Lightbox ──────────────────────────────────
function openLightbox(id) {
  const item = items.find(i => i.id === id);
  if (!item?.imagen) return;
  document.getElementById('lightboxImg').src = item.imagen;
  document.getElementById('lightbox').classList.remove('hidden');
}

document.getElementById('lightbox').addEventListener('click', () => {
  document.getElementById('lightbox').classList.add('hidden');
});

// ── Init ─────────────────────────────────────
checkSession();
