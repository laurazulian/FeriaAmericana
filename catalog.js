// catalog.js — catálogo público, solo lectura

let items = [];
let currentFilter = 'todas';

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
        <strong>No hay prendas disponibles</strong>
        <p>Volvé pronto para ver las novedades.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="card">
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
        </div>
      </div>
    </div>
  `).join('');
}

function showLoading() {
  document.getElementById('catalogGrid').innerHTML = `
    <div class="empty-state">
      <div class="icon">⏳</div>
      <strong>Cargando catálogo...</strong>
    </div>`;
}

function showError() {
  document.getElementById('catalogGrid').innerHTML = `
    <div class="empty-state">
      <div class="icon">⚠️</div>
      <strong>No se pudo cargar el catálogo</strong>
      <p>Revisá tu conexión y recargá la página.</p>
    </div>`;
}

document.getElementById('filterGroup').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  render();
});

function openLightbox(id) {
  const item = items.find(i => i.id === id);
  if (!item?.imagen) return;
  document.getElementById('lightboxImg').src = item.imagen;
  document.getElementById('lightbox').classList.remove('hidden');
}

document.getElementById('lightbox').addEventListener('click', () => {
  document.getElementById('lightbox').classList.add('hidden');
});

async function init() {
  showLoading();
  try {
    // Agrega ?v= para evitar caché del navegador
    const res = await fetch(`data.json?v=${Date.now()}`);
    if (!res.ok) throw new Error();
    items = await res.json();
    render();
  } catch (e) {
    showError();
  }
}

init();
