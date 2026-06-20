// ================================================
// GRUPO PAUCCAR'S — JavaScript V7
// Google Sheets + Simulador + Buy/Sell + Galería
// ================================================

let inventoryManager;
let allVehicles = [];
let filteredVehicles = [];
let currentSortBy = 'newest';
let modalCarouselIndex = 0;
let currentModalVehicle = null;

// ================================================
// INIT
// ================================================

document.addEventListener('DOMContentLoaded', async function() {
    inventoryManager = new InventoryManager(CONFIG);
    try {
        allVehicles = await inventoryManager.loadInventory();
        filteredVehicles = [...allVehicles];
        displayVehicles(allVehicles);
        setupMobileMenu();
        setupSmoothScroll();
        setupScrollAnimations();
        setupSimulator();
        inventoryManager.startAutoRefresh();
    } catch (error) {
        showErrorState(error.message);
    }
});

// ================================================
// FILTROS
// ================================================

function applyFilters() {
    const filters = {
        type:  document.getElementById('filterType').value,
        brand: document.getElementById('filterBrand').value,
        model: document.getElementById('filterModel').value.toLowerCase(),
        year:  document.getElementById('filterYear').value,
        km:    document.getElementById('filterKm').value,
        fuel:  document.getElementById('filterFuel').value
    };
    filteredVehicles = inventoryManager.filterVehicles(filters);
    sortVehicles(currentSortBy);
}

function resetFilters() {
    ['filterType','filterBrand','filterModel','filterYear','filterKm','filterFuel']
        .forEach(id => { document.getElementById(id).value = ''; });
    filteredVehicles = [...allVehicles];
    displayVehicles(allVehicles);
}

function increaseYear() {
    const el = document.getElementById('filterYear');
    el.value = Math.min((parseInt(el.value) || 2020) + 1, 2026);
}
function decreaseYear() {
    const el = document.getElementById('filterYear');
    el.value = Math.max((parseInt(el.value) || 2020) - 1, 2000);
}

// ================================================
// ORDENAMIENTO
// ================================================

function sortVehicles(sortBy) {
    currentSortBy = sortBy;
    const sorted = [...filteredVehicles];
    if (sortBy === 'newest')     sorted.sort((a,b) => b.year - a.year);
    if (sortBy === 'price-low')  sorted.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-high') sorted.sort((a,b) => b.price - a.price);
    if (sortBy === 'km-low')     sorted.sort((a,b) => a.km - b.km);
    displayVehicles(sorted);
}

// ================================================
// DISPLAY VEHÍCULOS
// ================================================

const VEHICLES_PER_PAGE = 12;
let currentVehicleList = [];
let currentShowing = VEHICLES_PER_PAGE;

function displayVehicles(list) {
    const grid  = document.getElementById('vehiclesGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('resultsCount');

    currentVehicleList = list;
    currentShowing = VEHICLES_PER_PAGE;

    if (count) count.textContent = `+${list.length} vehículo${list.length !== 1 ? 's' : ''} encontrado${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
        grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    grid.style.display = 'grid';
    if (empty) empty.style.display = 'none';

    renderVehiclePage();
}

function renderVehiclePage() {
    const grid = document.getElementById('vehiclesGrid');
    const visible = currentVehicleList.slice(0, currentShowing);
    const hasMore = currentShowing < currentVehicleList.length;

    grid.innerHTML = visible.map(v => createVehicleCard(v)).join('');

    // Quitar botón anterior si existe
    const oldBtn = document.getElementById('btn-ver-mas');
    if (oldBtn) oldBtn.remove();

    if (hasMore) {
        const btn = document.createElement('div');
        btn.id = 'btn-ver-mas';
        btn.style.cssText = 'grid-column:1/-1;text-align:center;padding:20px 0;';
        btn.innerHTML = `
            <button onclick="verMasVehiculos()"
                style="background:linear-gradient(135deg,#1464F0,#0B52D4);
                       color:#fff;border:none;padding:14px 40px;border-radius:12px;
                       font-family:'Barlow Condensed',sans-serif;font-size:18px;
                       font-weight:700;letter-spacing:0.05em;cursor:pointer;
                       box-shadow:0 4px 20px rgba(20,100,240,0.4);
                       transition:all 0.3s;">
                <i class="fas fa-car"></i> VER MÁS VEHÍCULOS
                (${currentVehicleList.length - currentShowing} restantes)
            </button>`;
        grid.parentNode.insertBefore(btn, grid.nextSibling);
    }
}

function verMasVehiculos() {
    currentShowing += VEHICLES_PER_PAGE;
    renderVehiclePage();
    // Scroll suave al nuevo contenido
    document.getElementById('vehiclesGrid').lastElementChild?.scrollIntoView({behavior:'smooth', block:'nearest'});
}

// ================================================
// TARJETA — Estilo referencia PaucCars
// ================================================

function createVehicleCard(vehicle) {
    const waMsg = `Hola Grupo Pauccar's, estoy interesado en el ${vehicle.brand} ${vehicle.model} ${vehicle.year}. ¿Está disponible?`;
    const waUrl = `https://wa.me/573206888120?text=${encodeURIComponent(waMsg)}`;

    return `
    <div class="vehicle-card ${vehicle.estado && vehicle.estado.toLowerCase().includes('vendido') ? 'card-vendida' : vehicle.estado && vehicle.estado.toLowerCase().includes('reservado') ? 'card-reservada' : ''}"
         onclick="${vehicle.estado && vehicle.estado.toLowerCase().includes('vendido') ? '' : `openVehicleModal(${vehicle.id})`}"
         style="${vehicle.estado && vehicle.estado.toLowerCase().includes('vendido') ? 'cursor:default;opacity:0.7;' : ''}">

        <!-- IMAGEN -->
        <div class="vehicle-image">
            <div class="vehicle-img-wrap">
                <img src="${vehicle.image}"
                     alt="${vehicle.brand} ${vehicle.model} ${vehicle.year}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x220/0D1230/1464F0?text=Sin+Foto'">
            </div>
            <span class="card-badge ${vehicle.estado && vehicle.estado.toLowerCase().includes('vendido') ? 'badge-vendido' : vehicle.estado && vehicle.estado.toLowerCase().includes('reservado') ? 'badge-reservado' : 'badge-disponible'}">
                ${vehicle.estado && vehicle.estado.toLowerCase().includes('vendido') ? 'VENDIDO' : vehicle.estado && vehicle.estado.toLowerCase().includes('reservado') ? 'RESERVADO' : 'DISPONIBLE'}
            </span>
            <button class="card-heart" onclick="toggleFavorito(event, this)">
                <i class="far fa-heart"></i>
            </button>
            <!-- Logo watermark sobre la foto -->
            <div class="vehicle-watermark">
                <img src="Imagenes/pau.png" alt="Grupo Pauccar's" draggable="false">
            </div>
        </div>

        <!-- INFO -->
        <div class="vehicle-info">
            <div class="vehicle-name">${vehicle.brand} ${vehicle.model}</div>
            <div class="vehicle-specs-row">
                <span class="spec-item"><i class="fas fa-calendar-alt"></i> ${vehicle.year}</span>
                <span class="spec-item"><i class="fas fa-road"></i> ${formatNumber(vehicle.km)} km</span>
                <span class="spec-item"><i class="fas fa-cog"></i> ${vehicle.transmission}</span>
                <span class="spec-item"><i class="fas fa-gas-pump"></i> ${vehicle.fuel}</span>
            </div>
            <div class="vehicle-price">${formatPrice(vehicle.price)}</div>
            <div class="vehicle-actions">
                <button class="btn-ver-detalle" onclick="event.stopPropagation(); openVehicleModal(${vehicle.id})">
                    <i class="fas fa-eye"></i> VER DETALLE
                </button>
                <a href="${waUrl}" class="btn-wp-card" target="_blank" onclick="event.stopPropagation()">
                    <i class="fab fa-whatsapp"></i>
                </a>
            </div>
        </div>
    </div>`;
}

// ================================================
// MODAL DETALLE VEHÍCULO
// ================================================

function openVehicleModal(vehicleId) {
    const vehicle = inventoryManager.getVehicleById(vehicleId);
    if (!vehicle) return;

    currentModalVehicle = vehicle;
    modalCarouselIndex  = 0;

    const modal     = document.getElementById('vehicleModal');
    const modalBody = document.getElementById('modalBody');

    const waMsg = `Hola Pauccar's, quiero más información sobre el ${vehicle.brand} ${vehicle.model} (${vehicle.year})`;
    const waUrl = `https://wa.me/573206888120?text=${encodeURIComponent(waMsg)}`;

    const hasMulti = vehicle.images && vehicle.images.length > 1;

    // Watermark: logo en foto — sin fondo, borde azul neón como en el header
    const wm = ``;

    const imageHTML = hasMulti ? `
        <div class="modal-carousel" style="position:relative;">
            ${vehicle.images.map((img, i) => `
                <img src="${img}" alt="${vehicle.brand} ${vehicle.model}"
                     class="modal-carousel-image ${i === 0 ? 'active' : ''}"
                     id="modal-img-${i}">
            `).join('')}
            ${wm}
            <button class="modal-carousel-btn modal-carousel-prev" onclick="event.stopPropagation();modalPrevImage(${vehicle.images.length})">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="modal-carousel-btn modal-carousel-next" onclick="event.stopPropagation();modalNextImage(${vehicle.images.length})">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="modal-carousel-counter" style="top:64px;right:14px;"><span id="modal-counter">1</span>/${vehicle.images.length}</div>
            <div class="modal-carousel-dots">
                ${vehicle.images.map((_,i) => `
                    <span class="modal-carousel-dot ${i===0?'active':''}"
                          onclick="event.stopPropagation();goToModalImage(${i})"></span>
                `).join('')}
            </div>
        </div>` : `
        <div style="position:relative;background:#080C1E;overflow:hidden;border-radius:16px 16px 0 0;">
            <img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}"
                 style="width:100%;height:260px;object-fit:cover;display:block;">
            ${wm}
        </div>`;

    // ── Helper: celda ficha técnica
    const cell = (label, value, icon) => {
        if (!value || value === 'N/A' || value === '') return '';
        return `<div style="background:#111A3F;padding:13px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.07);">
            <div style="color:rgba(255,255,255,.38);font-size:9px;font-weight:800;margin-bottom:3px;text-transform:uppercase;letter-spacing:.09em;">
                <i class="${icon}" style="margin-right:4px;color:#1464F0;"></i>${label}
            </div>
            <div style="font-size:15px;font-weight:700;color:#fff;">${value}</div>
        </div>`;
    };

    const soatColor  = vehicle.soat === 'Vigente' ? '#22C55E' : '#EF4444';
    const tecnoColor = vehicle.tecnomecanica === 'Vigente' ? '#10B981' : '#EF4444';

    modalBody.innerHTML = `
        ${imageHTML}

        <div style="padding:12px 16px 16px;background:linear-gradient(160deg,rgba(8,20,50,0.98) 0%,rgba(5,10,24,0.98) 60%,rgba(3,7,18,0.98) 100%);">

            <!-- Nombre + precio + logo -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">
                <div style="flex:1;min-width:0;">
                    <h2 style="font-family:'Poppins',sans-serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:3px;line-height:1.2;">
                        ${vehicle.brand} ${vehicle.model}
                        <span style="font-size:13px;font-weight:400;color:rgba(255,255,255,0.45);margin-left:6px;">${vehicle.year}</span>
                    </h2>
                    <div style="font-family:'Poppins',sans-serif;font-size:21px;font-weight:700;color:#F0B429;line-height:1;">
                        $ ${formatPrice(vehicle.price)}
                    </div>
                </div>
                <!-- Logo Pauccar's al lado del precio — sin cuadro -->
                <div style="flex-shrink:0;">
                    <img src="Imagenes/pau.png" alt="Grupo Pauccar's"
                         style="height:60px;width:auto;display:block;
                                filter:drop-shadow(0 0 6px rgba(30,144,255,0.35));">
                </div>
            </div>

            <!-- Specs compactos en grid 2 columnas -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px;">
                ${[
                    {icon:'fa-calendar-alt', label:'AÑO', val: vehicle.year},
                    {icon:'fa-road', label:'KM', val: formatNumber(vehicle.km)+' km'},
                    {icon:'fa-cog', label:'TRANSMISIÓN', val: vehicle.transmission},
                    {icon:'fa-gas-pump', label:'COMBUSTIBLE', val: vehicle.fuel},
                    vehicle.color ? {icon:'fa-palette', label:'COLOR', val: vehicle.color} : null,
                    vehicle.placa ? {icon:'fa-id-card', label:'PLACA', val: vehicle.placa} : null,
                    vehicle.ciudad ? {icon:'fa-map-marker-alt', label:'CIUDAD', val: vehicle.ciudad} : null,
                    vehicle.ubicacion ? {icon:'fa-map-pin', label:'UBICACIÓN', val: vehicle.ubicacion} : null,
                ].filter(Boolean).map(s => `
                    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 10px;">
                        <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px;">
                            <i class="fas ${s.icon}" style="font-size:10px;color:#1464F0;"></i>
                            <span style="font-size:9px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.06em;font-family:'Inter',sans-serif;">${s.label}</span>
                        </div>
                        <div style="font-size:12px;font-weight:600;color:#fff;font-family:'Inter',sans-serif;">${s.val}</div>
                    </div>
                `).join('')}
            </div>

            <!-- SOAT y Tecno compactos -->
            ${(vehicle.soat || vehicle.tecnomecanica) ? `
            <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
                ${vehicle.soat ? `
                <div style="flex:1;min-width:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 10px;">
                    <div style="font-size:8px;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.05em;font-family:'Inter',sans-serif;margin-bottom:1px;">SOAT</div>
                    <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);font-family:'Inter',sans-serif;">${vehicle.soat}</div>
                </div>` : ''}
                ${vehicle.tecnomecanica ? `
                <div style="flex:1;min-width:100px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 10px;">
                    <div style="font-size:8px;font-weight:600;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.05em;font-family:'Inter',sans-serif;margin-bottom:1px;">TECNOMECÁNICA</div>
                    <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);font-family:'Inter',sans-serif;">${vehicle.tecnomecanica}</div>
                </div>` : ''}
            </div>` : ''}

            <!-- Botones compactos -->
            <div style="display:flex;gap:8px;">
                <a href="${`https://wa.me/573206888120?text=${encodeURIComponent(`Hola Pauccar's, me interesa el ${vehicle.brand} ${vehicle.model} ${vehicle.year}. ¿Está disponible?`)}`}"
                   target="_blank"
                   style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 0;background:#25D366;color:#fff;border-radius:8px;text-decoration:none;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;box-shadow:0 2px 10px rgba(37,211,102,0.3);">
                    <i class="fab fa-whatsapp" style="font-size:16px;"></i> WhatsApp
                </a>
                <a href="${`https://wa.me/573206888120?text=${encodeURIComponent(`Hola, quiero agendar para ver el ${vehicle.brand} ${vehicle.model} ${vehicle.year}`)}`}"
                   target="_blank"
                   style="padding:11px 14px;background:rgba(20,100,240,0.15);border:1px solid rgba(20,100,240,0.4);color:#7EB3FF;border-radius:8px;text-decoration:none;font-family:'Poppins',sans-serif;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
                    <i class="fas fa-calendar-alt"></i> Agendar
                </a>
            </div>
        </div>
    `;

    // Solo la X outer (del HTML) — no crear segunda X
    const existingX = modalBody.parentElement.querySelector('.modal-x-inner');
    if (existingX) existingX.remove(); // limpiar si quedó alguna

    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleModalKeyboard);

    // Mostrar X outer
    const xBtn = modal.querySelector('.modal-close-outer');
    if (xBtn) xBtn.style.display = 'flex';
}

function modalNextImage(total) {
    modalCarouselIndex = (modalCarouselIndex + 1) % total;
    updateModalCarousel();
}
function modalPrevImage(total) {
    modalCarouselIndex = (modalCarouselIndex - 1 + total) % total;
    updateModalCarousel();
}
function goToModalImage(idx) {
    modalCarouselIndex = idx;
    updateModalCarousel();
}
function updateModalCarousel() {
    document.querySelectorAll('.modal-carousel-image')
        .forEach((img,i) => img.classList.toggle('active', i === modalCarouselIndex));
    document.querySelectorAll('.modal-carousel-dot')
        .forEach((dot,i) => dot.classList.toggle('active', i === modalCarouselIndex));
    const ctr = document.getElementById('modal-counter');
    if (ctr) ctr.textContent = modalCarouselIndex + 1;
}

function closeModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.style.display = 'none';
        const xBtn = modal.querySelector('.modal-close-outer');
        if (xBtn) xBtn.style.display = 'none';
    }
    document.body.style.overflow = '';
    modalCarouselIndex = 0;
    currentModalVehicle = null;
    document.removeEventListener('keydown', handleModalKeyboard);
}

function handleModalKeyboard(e) {
    if (!currentModalVehicle) return;
    const total = currentModalVehicle.images?.length || 1;
    if (e.key === 'ArrowLeft'  && total > 1) { e.preventDefault(); modalPrevImage(total); }
    if (e.key === 'ArrowRight' && total > 1) { e.preventDefault(); modalNextImage(total); }
    if (e.key === 'Escape')                  { e.preventDefault(); closeModal(); }
}

// Cierre con clic fuera
window.addEventListener('click', function(e) {
    const vm = document.getElementById('vehicleModal');
    const cm = document.getElementById('creditModal');
    if (e.target === vm) closeModal();
    if (cm && e.target === cm) cm.style.display = 'none';
});

// ================================================
// SIMULADOR DE FINANCIACIÓN
// ================================================

function setupSimulator() {
    // ya está enlazado vía oninput en el HTML
}

function updateRate() {
    const v = document.getElementById('simRate').value;
    document.getElementById('rateDisplay').textContent = v + '%';
    document.getElementById('rateLabel').textContent   = v + '%';
}

function calcularCuota() {
    const precio  = parseFloat(document.getElementById('simPrice').value)   || 0;
    const inicial = parseFloat(document.getElementById('simInitial').value) || 0;
    const tasa    = parseFloat(document.getElementById('simRate').value)    / 100;
    const meses   = parseInt(document.getElementById('simMonths').value)    || 60;

    updateRate();

    if (precio <= 0 || precio <= inicial) {
        document.getElementById('simResult').classList.remove('show');
        return;
    }

    const capital = precio - inicial;
    // Fórmula cuota fija: C = P * i / (1 - (1+i)^-n)
    const cuota   = capital * tasa / (1 - Math.pow(1 + tasa, -meses));
    const totalPagado = cuota * meses + inicial;

    document.getElementById('simCuota').textContent = '$ ' + formatPrice(Math.round(cuota));
    document.getElementById('simDetail').innerHTML  =
        `Capital financiado: <strong>$ ${formatPrice(Math.round(capital))}</strong><br>
         Plazo: <strong>${meses} meses</strong> · Tasa: <strong>${(tasa*100).toFixed(1)}% mensual</strong><br>
         Total a pagar estimado: <strong>$ ${formatPrice(Math.round(totalPagado))}</strong><br>
         <em style="color:rgba(255,255,255,.4);font-size:11px;">*Valor indicativo. Sujeto a estudio de crédito.</em>`;
    document.getElementById('simResult').classList.add('show');
}

function solicitarCredito() {
    const modal = document.getElementById('creditModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// ── Muestra/oculta los campos de empleado según selección
function toggleCamposEmpleado(valor) {
    const campos = document.getElementById('camposEmpleado');
    if (!campos) return;
    campos.style.display = valor === 'empleado' ? 'flex' : 'none';
}
window.toggleCamposEmpleado = toggleCamposEmpleado;

function enviarSolicitudCredito(btn) {
    btn.innerHTML = '<i class="fas fa-check"></i> ¡Solicitud enviada! Te contactaremos pronto.';
    btn.style.background = '#25D366';
    btn.disabled = true;
    setTimeout(() => {
        const modal = document.getElementById('creditModal');
        if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
    }, 2500);
}

// ================================================
// COMPRAR / VENDER
// ================================================

function sendBuyRequest() {
    const nombre = document.querySelectorAll('.buy-card .bsc-input')[0].value;
    const wa     = document.querySelectorAll('.buy-card .bsc-input')[1].value;
    const busca  = document.querySelectorAll('.buy-card .bsc-input')[2].value;
    const ppto   = document.querySelectorAll('.buy-card .bsc-input')[3].value;
    const msg    = `Hola Pauccar's! 🚗 Quiero COMPRAR un vehículo.\n\nNombre: ${nombre}\nBusco: ${busca}\nPresupuesto: ${ppto}\nTeléfono: ${wa}`;
    window.open(`https://wa.me/573206888120?text=${encodeURIComponent(msg)}`, '_blank');
}

function sendSellRequest() {
    const nombre  = document.querySelectorAll('.sell-card .bsc-input')[0].value;
    const wa      = document.querySelectorAll('.sell-card .bsc-input')[1].value;
    const vehiculo= document.querySelectorAll('.sell-card .bsc-input')[2].value;
    const precio  = document.querySelectorAll('.sell-card .bsc-input')[3].value;
    const msg     = `Hola Pauccar's! 💰 Quiero VENDER mi vehículo.\n\nNombre: ${nombre}\nVehículo: ${vehiculo}\nPrecio esperado: $${precio}\nTeléfono: ${wa}`;
    window.open(`https://wa.me/573206888120?text=${encodeURIComponent(msg)}`, '_blank');
}

// ================================================
// ERROR STATE
// ================================================

function showErrorState(msg) {
    const grid = document.getElementById('vehiclesGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size:56px;color:#E8132A;margin-bottom:20px;display:block;"></i>
            <h3 style="font-size:22px;margin-bottom:12px;color:#fff;">No se pudo cargar el inventario</h3>
            <p style="color:rgba(255,255,255,.5);margin-bottom:24px;">${msg}</p>
            <button onclick="location.reload()"
                style="padding:14px 32px;background:#0B52D4;color:#fff;border:none;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer;font-family:'Barlow',sans-serif;">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>`;
}

// ================================================
// MENÚ MÓVIL
// ================================================

function setupMobileMenu() {
    const btn = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => nav.classList.toggle('active'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('active')));
}

// ================================================
// SMOOTH SCROLL
// ================================================

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (!target) return;

            // Si el destino es #inicio, ir al tope absoluto
            if (href === '#inicio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Para las demás secciones, compensar el header sticky (70px)
            const headerH = document.querySelector('.header')?.offsetHeight || 70;
            const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// ================================================
// SCROLL ANIMATIONS
// ================================================

function setupScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('section').forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(24px)';
        s.style.transition = 'opacity .6s ease, transform .6s ease';
        observer.observe(s);
    });
}

// ================================================
// UTILS
// ================================================

function formatPrice(p) { return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function formatNumber(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function capitalizeFirst(s) { if (!s) return ''; return s.charAt(0).toUpperCase() + s.slice(1); }

// ================================================
// GLOBALS
// ================================================

window.applyFilters      = applyFilters;
window.resetFilters      = resetFilters;
window.sortVehicles      = sortVehicles;
window.openVehicleModal  = openVehicleModal;
window.closeModal        = closeModal;
window.increaseYear      = increaseYear;
window.decreaseYear      = decreaseYear;
window.modalNextImage    = modalNextImage;
window.modalPrevImage    = modalPrevImage;
window.goToModalImage    = goToModalImage;
window.calcularCuota     = calcularCuota;
window.updateRate        = updateRate;
window.solicitarCredito  = solicitarCredito;
window.enviarSolicitudCredito = enviarSolicitudCredito;
window.sendBuyRequest    = sendBuyRequest;
window.sendSellRequest   = sendSellRequest;
window.openPhotoLightbox = openPhotoLightbox;
window.closePhotoLightbox= closePhotoLightbox;
window.lbNext            = lbNext;
window.lbPrev            = lbPrev;

console.log('✅ Grupo Pauccar\'s JS V7 cargado correctamente');

// ═══════════════════════════════════════════════
// FAVORITOS — toggle corazón rojo al seleccionar
// ═══════════════════════════════════════════════
function toggleFavorito(e, btn) {
    e.stopPropagation();  // evita abrir el modal
    e.preventDefault();
    const icon = btn.querySelector('i');
    const active = btn.classList.toggle('heart-active');
    icon.className = active ? 'fas fa-heart' : 'far fa-heart';
}
window.toggleFavorito = toggleFavorito;

// ═══════════════════════════════════════════════════════════════
// CLIENTES FELICES — Lee de la hoja "Clientes Felices" del Sheets
// Columnas: A=Nombre | B=Ciudad | C=Vehiculo | D=Foto | E=Reseña
// ═══════════════════════════════════════════════════════════════
// ── Clientes Felices
// Columnas: A=Nombre | B=Ciudad | C=Vehículo
//           D=Foto1 | E=Foto2 | F=Foto3
//           G=Video (link Drive) | H=Reseña
async function loadClientesFelices() {
    const sheetName = encodeURIComponent('Clientes Felices');
    const url = `${CONFIG.SHEETS_API_URL}/${CONFIG.SHEET_ID}/values/${sheetName}?key=${CONFIG.API_KEY}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.values || data.values.length < 2) return;

        const clientes = data.values.slice(3).map(row => {
            // Fotos: columnas D, E, F (índices 3,4,5)
            const fotos = [row[3], row[4], row[5]]
                .map(f => convertDriveUrl((f || '').trim()))
                .filter(Boolean);
            return {
                nombre:   (row[0] || '').trim(),
                ciudad:   (row[1] || '').trim(),
                vehiculo: (row[2] || '').trim(),
                fotos:    fotos,
                foto:     fotos[0] || '',
                resena:   (row[7] || '').trim(),
            };
        }).filter(c => c.nombre);

        renderClientesFelices(clientes);
    } catch(e) {
        console.log('Clientes felices: hoja no encontrada aún');
    }
}

function convertDriveUrl(url) {
    if (!url || !url.includes('drive.google.com')) return url;
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? `https://lh3.googleusercontent.com/d/${m[1]}=w600` : url;
}

function renderClientesFelices(clientes) {
    const grid = document.querySelector('.reviews-grid');
    if (!grid || !clientes.length) return;

    grid.innerHTML = clientes.map((c, idx) => {
        const totalFotos = c.fotos ? c.fotos.length : 0;
        const hasMulti   = totalFotos > 1;

        // Bloque de fotos — carrusel si hay más de una
        let mediaBlock = '';

        if (totalFotos > 0) {
            // Construir array de todas las fotos para el lightbox
            const allFotosJson = JSON.stringify(
                c.fotos.map(f => ({ src: f, caption: `${c.nombre} · ${c.vehiculo}` }))
            ).replace(/'/g, "\\'");

            if (hasMulti) {
                // Mini carrusel de fotos
                const imgs = c.fotos.map((f, i) => `
                    <img src="${f}" alt="${c.nombre} foto ${i+1}"
                         class="rc-carousel-img ${i===0?'active':''}"
                         data-idx="${i}"
                         onclick="openPhotoLightbox('${f}','${c.nombre} · ${c.vehiculo}',JSON.parse(this.closest('.rc-carousel').dataset.fotos))"
                         onerror="this.style.display='none'">`).join('');
                const dots = c.fotos.map((_,i) => `
                    <span class="rc-dot ${i===0?'active':''}" onclick="rcGoTo(${idx},${i})"></span>`).join('');
                mediaBlock = `
                <div class="review-card-photo rc-carousel" id="rc-${idx}" data-fotos='${JSON.stringify(c.fotos.map(f => ({ src: f, caption: c.nombre + ' · ' + (c.vehiculo||'') })))}'>
                    ${imgs}
                    <button class="rc-btn rc-prev" onclick="rcPrev(${idx},${totalFotos})">‹</button>
                    <button class="rc-btn rc-next" onclick="rcNext(${idx},${totalFotos})">›</button>
                    <div class="rc-dots">${dots}</div>
                    <span class="rc-counter">1 / ${totalFotos}</span>
                </div>`;
            } else {
                // Una sola foto
                mediaBlock = `
                <div class="review-card-photo" onclick="openPhotoLightbox('${c.fotos[0]}','${c.nombre} · ${c.vehiculo}')">
                    <img src="${c.fotos[0]}" alt="${c.nombre}"
                         onerror="this.parentElement.style.display='none'">
                </div>`;
            }
        }

        // Sin video — solo fotos
        return `
        <div class="review-card">
            ${mediaBlock}
            <div class="review-card-body">
                <div class="review-stars">⭐⭐⭐⭐⭐</div>
                ${c.resena ? `<p class="review-text">"${c.resena}"</p>` : ''}
                <div class="review-author">
                    <strong>${c.nombre}</strong>
                    <span>${c.vehiculo ? c.vehiculo + ' · ' : ''}${c.ciudad}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════════════
// FERIAS Y EVENTOS — Lee de la hoja "Ferias Eventos" del Sheets
// Columnas: A=Titulo | B=Fecha | C=Lugar | D=Foto | E=Descripcion
// ═══════════════════════════════════════════════════════════════
async function loadFeriasEventos() {
    const sheetName = encodeURIComponent('Ferias Eventos');
    const url = `${CONFIG.SHEETS_API_URL}/${CONFIG.SHEET_ID}/values/${sheetName}?key=${CONFIG.API_KEY}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.values || data.values.length < 2) return;

        // Columnas: A=Titulo | B=Fecha | C=Lugar | D=Foto1 | E=Foto2 | F=Foto3 | G=Descripcion
        const eventos = data.values.slice(3).map(row => {
            const fotos = [row[3], row[4], row[5]]
                .map(f => convertDriveUrl((f||'').trim()))
                .filter(Boolean);
            return {
                titulo:      (row[0] || '').trim(),
                fecha:       (row[1] || '').trim(),
                lugar:       (row[2] || '').trim(),
                fotos:       fotos,
                foto:        fotos[0] || '',
                descripcion: (row[6] || '').trim(),
            };
        }).filter(e => e.titulo);

        renderFeriasEventos(eventos);
    } catch(e) {
        console.log('Ferias: hoja no encontrada aún');
    }
}

function renderFeriasEventos(eventos) {
    const grid = document.querySelector('.events-grid');
    if (!grid || !eventos.length) return;

    grid.innerHTML = eventos.map((ev, idx) => {
        const totalFotos = ev.fotos ? ev.fotos.length : 0;
        const hasMulti   = totalFotos > 1;

        let mediaBlock = '';
        if (totalFotos > 0) {
            if (hasMulti) {
                const imgs = ev.fotos.map((f, i) => `
                    <img src="${f}" alt="${ev.titulo}"
                         class="rc-carousel-img ${i===0?'active':''}"
                         onclick="openPhotoLightbox('${f}','${ev.titulo}',JSON.parse(this.closest('.rc-carousel').dataset.fotos))"
                         onerror="this.style.display='none'">`).join('');
                const dots = ev.fotos.map((_,i) => `
                    <span class="rc-dot ${i===0?'active':''}" onclick="rcGoTo('ev-${idx}',${i})"></span>`).join('');
                mediaBlock = `
                <div class="review-card-photo rc-carousel" id="rc-ev-${idx}" data-fotos='${JSON.stringify(ev.fotos.map(f => ({ src: f, caption: ev.titulo })))}'>
                    ${imgs}
                    <button class="rc-btn rc-prev" onclick="rcPrev('ev-${idx}',${totalFotos})">‹</button>
                    <button class="rc-btn rc-next" onclick="rcNext('ev-${idx}',${totalFotos})">›</button>
                    <div class="rc-dots">${dots}</div>
                    <span class="rc-counter">1 / ${totalFotos}</span>
                </div>`;
            } else {
                mediaBlock = `
                <div class="review-card-photo" onclick="openPhotoLightbox('${ev.fotos[0]}','${ev.titulo}')">
                    <img src="${ev.fotos[0]}" alt="${ev.titulo}"
                         onerror="this.parentElement.style.display='none'">
                </div>`;
            }
        }

        // Sin video — solo fotos
        return `
        <div class="review-card">
            ${mediaBlock}
            <div class="review-card-body">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    <span style="background:rgba(20,100,240,0.2);color:#1E90FF;font-size:11px;font-weight:700;
                                 padding:3px 10px;border-radius:20px;letter-spacing:0.06em;">EVENTO</span>
                    ${ev.fecha ? `<span style="color:rgba(255,215,0,0.8);font-size:12px;font-weight:600;">
                        <i class="fas fa-calendar-alt"></i> ${ev.fecha}</span>` : ''}
                </div>
                <div class="vehicle-name" style="font-size:16px;margin-bottom:6px;">${ev.titulo}</div>
                ${ev.lugar ? `<p style="color:rgba(255,255,255,0.5);font-size:12px;margin-bottom:8px;">
                    <i class="fas fa-map-marker-alt" style="color:#1464F0;"></i> ${ev.lugar}</p>` : ''}
                ${ev.descripcion ? `<p class="review-text" style="font-style:normal;">${ev.descripcion}</p>` : ''}
            </div>
        </div>`;
    }).join('');
}


// ── Convertir link de Google Drive a URL embebible para video
function convertDriveVideoUrl(url) {
    if (!url) return null;
    // Link tipo: https://drive.google.com/file/d/FILE_ID/view
    var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    return null;
}

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadClientesFelices();
        loadFeriasEventos();
        loadAsesores();
    }, 1500);
});

// ═══════════════════════════════════════════════════════════════
// ASESORES COMERCIALES — Lee de la hoja "Asesores" del Sheets
// Columnas: A=Nombre | B=Cargo | C=Foto (link Drive) | D=WhatsApp
// ═══════════════════════════════════════════════════════════════
async function loadAsesores() {
    const sheetName = encodeURIComponent('Asesores');
    const url = `${CONFIG.SHEETS_API_URL}/${CONFIG.SHEET_ID}/values/${sheetName}?key=${CONFIG.API_KEY}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.values || data.values.length < 2) return;

        const asesores = data.values.slice(1).map(row => ({
            nombre:   (row[0] || '').trim(),
            cargo:    (row[1] || '').trim() || 'Asesor Comercial',
            foto:     convertDriveUrl((row[2] || '').trim()),
            whatsapp: (row[3] || '').toString().replace(/\D/g, ''),
        })).filter(a => a.nombre);

        if (asesores.length > 0) renderAsesores(asesores);
    } catch(e) {
        console.log('Asesores: hoja no encontrada aún');
    }
}

function renderAsesores(asesores) {
    const grid = document.getElementById('advisorsGrid');
    if (!grid) return;

    grid.innerHTML = asesores.map(a => {
        const waUrl = a.whatsapp
            ? `https://wa.me/${a.whatsapp.startsWith('57') ? a.whatsapp : '57' + a.whatsapp}?text=${encodeURIComponent('Hola ' + a.nombre + ', vi tu perfil en la página de Grupo Pauccar\'s y quisiera más información.')}`
            : '#';

        return `
        <div class="advisor-card">
            <div class="advisor-photo-wrap">
                ${a.foto
                    ? `<img src="${a.foto}" alt="${a.nombre}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`
                    : `<i class="fas fa-user"></i>`}
            </div>
            <div class="advisor-name">${a.nombre}</div>
            <div class="advisor-role">${a.cargo}</div>
            <a href="${waUrl}" target="_blank" class="advisor-whatsapp-btn" onclick="event.stopPropagation()">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
        </div>`;
    }).join('');
}
window.loadAsesores   = loadAsesores;
window.renderAsesores = renderAsesores;

// ================================================
// LIGHTBOX — Zoom foto clientes felices
// ================================================
// ================================================
// LIGHTBOX — Galería con flechas de navegación
// ================================================

// Estado global del lightbox
let _lbImages  = [];   // Array de { src, caption }
let _lbIndex   = 0;    // Índice actual

function openPhotoLightbox(src, caption, allImages) {
    // allImages = array de { src, caption } | undefined (foto sola)
    if (Array.isArray(allImages) && allImages.length > 1) {
        _lbImages = allImages;
        _lbIndex  = allImages.findIndex(img => img.src === src);
        if (_lbIndex < 0) _lbIndex = 0;
    } else {
        _lbImages = [{ src, caption: caption || '' }];
        _lbIndex  = 0;
    }

    // Crear overlay si no existe
    let overlay = document.getElementById('photoLightbox');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id        = 'photoLightbox';
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <div class="lightbox-img-wrap" onclick="event.stopPropagation()">
                <button class="lightbox-close" onclick="closePhotoLightbox()">✕</button>
                <button class="lb-arrow lb-prev" onclick="lbPrev()">&#8249;</button>
                <button class="lb-arrow lb-next" onclick="lbNext()">&#8250;</button>
                <img id="lightboxImg" src="" alt="">
                <div class="lb-counter" id="lbCounter"></div>
                <div class="lightbox-caption" id="lightboxCaption"></div>
            </div>`;
        overlay.addEventListener('click', closePhotoLightbox);
        document.body.appendChild(overlay);

        // Swipe táctil en móvil
        let touchStartX = 0;
        overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        overlay.addEventListener('touchend',   e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) { diff > 0 ? lbNext() : lbPrev(); }
        }, { passive: true });

        // Teclado
        document.addEventListener('keydown', function lbKeys(e) {
            const lb = document.getElementById('photoLightbox');
            if (!lb || !lb.classList.contains('active')) return;
            if (e.key === 'ArrowRight') lbNext();
            if (e.key === 'ArrowLeft')  lbPrev();
            if (e.key === 'Escape')     closePhotoLightbox();
        });
    }

    _lbRender();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function _lbRender() {
    const img     = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const counter = document.getElementById('lbCounter');
    const prev    = document.querySelector('.lb-prev');
    const next    = document.querySelector('.lb-next');
    if (!img) return;

    const current = _lbImages[_lbIndex] || {};
    img.src = current.src || '';
    if (caption) caption.textContent = current.caption || '';

    const total = _lbImages.length;
    if (counter) {
        counter.textContent = total > 1 ? `${_lbIndex + 1} / ${total}` : '';
        counter.style.display = total > 1 ? 'block' : 'none';
    }
    // Mostrar/ocultar flechas
    if (prev) prev.style.display = total > 1 ? 'flex' : 'none';
    if (next) next.style.display = total > 1 ? 'flex' : 'none';
}

function lbNext() {
    if (_lbImages.length < 2) return;
    _lbIndex = (_lbIndex + 1) % _lbImages.length;
    _lbRender();
}

function lbPrev() {
    if (_lbImages.length < 2) return;
    _lbIndex = (_lbIndex - 1 + _lbImages.length) % _lbImages.length;
    _lbRender();
}

function closePhotoLightbox() {
    const overlay = document.getElementById('photoLightbox');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ================================================
// MINI CARRUSEL — Clientes Felices y Ferias
// ================================================
function rcGetImages(id) {
    const wrap = document.getElementById('rc-' + id);
    return wrap ? wrap.querySelectorAll('.rc-carousel-img') : [];
}
function rcGetDots(id) {
    const wrap = document.getElementById('rc-' + id);
    return wrap ? wrap.querySelectorAll('.rc-dot') : [];
}
function rcGoTo(id, idx) {
    const imgs = rcGetImages(id);
    const dots = rcGetDots(id);
    const counter = document.querySelector('#rc-' + id + ' .rc-counter');
    imgs.forEach((img, i) => img.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (counter) counter.textContent = (idx + 1) + ' / ' + imgs.length;
    // Guardar índice actual en el elemento
    const wrap = document.getElementById('rc-' + id);
    if (wrap) wrap.dataset.current = idx;
}
function rcNext(id, total) {
    const wrap = document.getElementById('rc-' + id);
    const current = parseInt(wrap ? wrap.dataset.current || 0 : 0);
    rcGoTo(id, (current + 1) % total);
}
function rcPrev(id, total) {
    const wrap = document.getElementById('rc-' + id);
    const current = parseInt(wrap ? wrap.dataset.current || 0 : 0);
    rcGoTo(id, (current - 1 + total) % total);
}