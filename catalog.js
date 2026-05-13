// catalog.js — catálogo público, solo lectura

const STORAGE_KEY = 'feria_americana_v1';
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
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
        </div>
      </div>
    </div>
  `).join('');
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

render();
