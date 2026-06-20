// ================================================
// PAUCCARS - JAVASCRIPT COMPLETO V2
// ================================================

// INVENTARIO DE VEHÍCULOS (DATOS DE EJEMPLO)
const vehicles = [
    {
        id: 1,
        name: 'Chevrolet Onix LTZ',
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2019,
        price: 45000000,
        km: 62500,
        fuel: 'Gasolina',
        type: 'Sedan',
        image: 
        'Imagenes/Checrolet-onixltz-2019.png', 
        transmission: 'Manual',
        color: 'Gris'
    },
    {
        id: 2,
        name: 'Toyota Corolla 2021',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2021,
        price: 75000000,
        km: 45000,
        fuel: 'gasolina',
        type: 'sedan',
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        transmission: 'Automático',
        color: 'Gris'
    },
    {
        id: 3,
        name: 'Chevrolet Onix 2023',
        brand: 'Chevrolet',
        model: 'Onix',
        year: 2023,
        price: 52000000,
        km: 15000,
        fuel: 'gasolina',
        type: 'hatchback',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
        transmission: 'Manual',
        color: 'Negro'
    },
    {
        id: 4,
        name: 'Mazda CX-5 2020',
        brand: 'Mazda',
        model: 'CX-5',
        year: 2020,
        price: 95000000,
        km: 60000,
        fuel: 'gasolina',
        type: 'suv',
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
        transmission: 'Automático',
        color: 'Rojo'
    },
    {
        id: 5,
        name: 'Renault Duster 2021',
        brand: 'Renault',
        model: 'Duster',
        year: 2021,
        price: 62000000,
        km: 40000,
        fuel: 'gasolina',
        type: 'suv',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
        transmission: 'Manual',
        color: 'Azul'
    },
    {
        id: 6,
        name: 'Nissan Frontier 2022',
        brand: 'Nissan',
        model: 'Frontier',
        year: 2022,
        price: 105000000,
        km: 25000,
        fuel: 'diesel',
        type: 'pickup',
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800',
        transmission: 'Automático',
        color: 'Plata'
    },
    {
        id: 7,
        name: 'Hyundai Tucson 2023',
        brand: 'Hyundai',
        model: 'Tucson',
        year: 2023,
        price: 115000000,
        km: 10000,
        fuel: 'gasolina',
        type: 'suv',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        transmission: 'Automático',
        color: 'Blanco'
    },
    {
        id: 8,
        name: 'Kia Sportage 2021',
        brand: 'Kia',
        model: 'Sportage',
        year: 2021,
        price: 85000000,
        km: 35000,
        fuel: 'gasolina',
        type: 'suv',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
        transmission: 'Automático',
        color: 'Negro'
    },
    {
        id: 9,
        name: 'Ford Escape 2022',
        brand: 'Ford',
        model: 'Escape',
        year: 2022,
        price: 98000000,
        km: 18000,
        fuel: 'hibrido',
        type: 'suv',
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
        transmission: 'Automático',
        color: 'Azul'
    },
    {
        id: 10,
        name: 'Honda Civic 2020',
        brand: 'Honda',
        model: 'Civic',
        year: 2020,
        price: 68000000,
        km: 52000,
        fuel: 'gasolina',
        type: 'sedan',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        transmission: 'Automático',
        color: 'Rojo'
    }
];

// VARIABLES GLOBALES
let filteredVehicles = [...vehicles];
let currentSortBy = 'newest';

// ================================================
// INICIALIZACIÓN
// ================================================

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    console.log('✅ Inicializando Pauccars...');
    
    // Mostrar todos los vehículos
    displayVehicles(vehicles);
    
    // Configurar menú móvil
    setupMobileMenu();
    
    // Configurar scroll suave
    setupSmoothScroll();
    
    // Animaciones
    setupScrollAnimations();
    
    console.log(`📊 ${vehicles.length} vehículos cargados`);
}

// ================================================
// FILTROS
// ================================================

function applyFilters() {
    const filters = {
        type: document.getElementById('filterType').value,
        brand: document.getElementById('filterBrand').value,
        model: document.getElementById('filterModel').value.toLowerCase(),
        year: document.getElementById('filterYear').value,
        km: document.getElementById('filterKm').value,
        fuel: document.getElementById('filterFuel').value
    };
    
    filteredVehicles = vehicles.filter(vehicle => {
        if (filters.type && vehicle.type !== filters.type) return false;
        if (filters.brand && vehicle.brand !== filters.brand) return false;
        if (filters.model && !vehicle.model.toLowerCase().includes(filters.model)) return false;
        if (filters.year && vehicle.year.toString() !== filters.year) return false;
        if (filters.km) {
            const maxKm = parseInt(filters.km);
            if (vehicle.km > maxKm) return false;
        }
        if (filters.fuel && vehicle.fuel !== filters.fuel) return false;
        
        return true;
    });
    
    sortVehicles(currentSortBy);
}

function resetFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterBrand').value = '';
    document.getElementById('filterModel').value = '';
    document.getElementById('filterYear').value = '';
    document.getElementById('filterKm').value = '';
    document.getElementById('filterFuel').value = '';
    
    filteredVehicles = [...vehicles];
    displayVehicles(vehicles);
}

// Funciones para los botones de año
function increaseYear() {
    const yearInput = document.getElementById('filterYear');
    const currentValue = parseInt(yearInput.value) || 2020;
    yearInput.value = Math.min(currentValue + 1, 2025);
}

function decreaseYear() {
    const yearInput = document.getElementById('filterYear');
    const currentValue = parseInt(yearInput.value) || 2020;
    yearInput.value = Math.max(currentValue - 1, 2000);
}

// ================================================
// ORDENAMIENTO
// ================================================

function sortVehicles(sortBy) {
    currentSortBy = sortBy;
    
    const sorted = [...filteredVehicles];
    
    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => b.year - a.year);
            break;
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'km-low':
            sorted.sort((a, b) => a.km - b.km);
            break;
    }
    
    displayVehicles(sorted);
}

// ================================================
// VISUALIZACIÓN DE VEHÍCULOS
// ================================================

function displayVehicles(vehiclesToShow) {
    const grid = document.getElementById('vehiclesGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    
    // Actualizar contador
    resultsCount.textContent = `${vehiclesToShow.length} vehículo${vehiclesToShow.length !== 1 ? 's' : ''} encontrado${vehiclesToShow.length !== 1 ? 's' : ''}`;
    
    // Mostrar estado vacío si no hay resultados
    if (vehiclesToShow.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Generar tarjetas
    grid.innerHTML = vehiclesToShow.map(vehicle => createVehicleCard(vehicle)).join('');
}

function createVehicleCard(vehicle) {
    const whatsappMsg = `Hola Pauccars, estoy interesado en el ${vehicle.name} (${vehicle.year}). ¿Está disponible?`;
    const whatsappUrl = `https://wa.me/573206888120?text=${encodeURIComponent(whatsappMsg)}`;
    
    return `
        <div class="vehicle-card" onclick="openVehicleModal(${vehicle.id})">
            <div class="vehicle-image">
                <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
                <div class="vehicle-badge">Disponible</div>
            </div>
            
            <div class="vehicle-info">
                <div class="vehicle-name">${vehicle.name}</div>
                
                <div class="vehicle-specs">
                    <div class="spec">
                        <i class="fas fa-calendar"></i>
                        <strong>${vehicle.year}</strong>
                    </div>
                    <div class="spec">
                        <i class="fas fa-road"></i>
                        <strong>${formatNumber(vehicle.km)} km</strong>
                    </div>
                    <div class="spec">
                        <i class="fas fa-cog"></i>
                        <strong>${vehicle.transmission}</strong>
                    </div>
                    <div class="spec">
                        <i class="fas fa-gas-pump"></i>
                        <strong>${capitalizeFirst(vehicle.fuel)}</strong>
                    </div>
                </div>
                
                <div class="vehicle-price">$${formatPrice(vehicle.price)}</div>
                
                <div class="vehicle-actions">
                    <button class="btn-details" onclick="event.stopPropagation(); openVehicleModal(${vehicle.id})">
                        Ver detalle
                    </button>
                    <a href="${whatsappUrl}" class="btn-whatsapp-card" target="_blank" onclick="event.stopPropagation()">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}



// ================================================
// MODAL DE DETALLE
// ================================================

function openVehicleModal(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const modal = document.getElementById('vehicleModal');
    const modalBody = document.getElementById('modalBody');
    
    const whatsappMsg = `Hola Pauccars, quiero más información sobre el ${vehicle.name} (${vehicle.year})`;
    const whatsappUrl = `https://wa.me/573206888120?text=${encodeURIComponent(whatsappMsg)}`;
    
    modalBody.innerHTML = `
        <div style="position: relative;">
            <img src="${vehicle.image}" alt="${vehicle.name}" style="width: 100%; height: 350px; object-fit: cover; border-radius: 16px 16px 0 0;">
            
            <div style="padding: 32px;">
                <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 8px; color: #111827;">${vehicle.name}</h2>
                <div style="font-size: 36px; font-weight: 900; color: #003d99; margin-bottom: 28px;">
                    $${formatPrice(vehicle.price)}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 28px;">
                    <div style="background: #F9FAFB; padding: 18px; border-radius: 10px;">
                        <div style="color: #6B7280; font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">Año</div>
                        <div style="font-size: 22px; font-weight: 700; color: #111827;">${vehicle.year}</div>
                    </div>
                    <div style="background: #F9FAFB; padding: 18px; border-radius: 10px;">
                        <div style="color: #6B7280; font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">Kilometraje</div>
                        <div style="font-size: 22px; font-weight: 700; color: #111827;">${formatNumber(vehicle.km)} km</div>
                    </div>
                    <div style="background: #F9FAFB; padding: 18px; border-radius: 10px;">
                        <div style="color: #6B7280; font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">Combustible</div>
                        <div style="font-size: 17px; font-weight: 700; color: #111827; text-transform: capitalize;">${vehicle.fuel}</div>
                    </div>
                    <div style="background: #F9FAFB; padding: 18px; border-radius: 10px;">
                        <div style="color: #6B7280; font-size: 12px; font-weight: 700; margin-bottom: 4px; text-transform: uppercase;">Transmisión</div>
                        <div style="font-size: 17px; font-weight: 700; color: #111827;">${vehicle.transmission}</div>
                    </div>
                </div>
                
                <div style="background: #F9FAFB; padding: 22px; border-radius: 10px; margin-bottom: 22px;">
                    <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 14px; color: #111827;">
                        <i class="fas fa-shield-alt" style="color: #003d99;"></i> Incluye
                    </h3>
                    <ul style="list-style: none; padding: 0; display: grid; gap: 10px;">
                        <li style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10B981;"></i>
                            <span>Garantía de 3 meses</span>
                        </li>
                        <li style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10B981;"></i>
                            <span>Inspección técnica completa</span>
                        </li>
                        <li style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10B981;"></i>
                            <span>Documentación al día</span>
                        </li>
                        <li style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10B981;"></i>
                            <span>Posibilidad de financiación</span>
                        </li>
                    </ul>
                </div>
                
                <a href="${whatsappUrl}" target="_blank" style="display: block; background: #25D366; color: white; text-align: center; padding: 16px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
                    <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
                </a>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('vehicleModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ================================================
// MODAL DE PRESUPUESTO
// ================================================

function openBudgetModal() {
    const modal = document.getElementById('budgetModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeBudgetModal() {
    const modal = document.getElementById('budgetModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const vehicleModal = document.getElementById('vehicleModal');
    const budgetModal = document.getElementById('budgetModal');
    
    if (event.target === vehicleModal) {
        closeModal();
    }
    if (event.target === budgetModal) {
        closeBudgetModal();
    }
}

// ================================================
// MENÚ MÓVIL
// ================================================

function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }
}

// ================================================
// SCROLL SUAVE
// ================================================

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorar si es solo "#"
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================================
// ANIMACIONES AL SCROLL
// ================================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar a secciones
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ================================================
// UTILIDADES
// ================================================

function formatPrice(price) {
    // Formato colombiano: 45.000.000
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatNumber(num) {
    // Formato con comas: 45,000
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================================================
// EXPORTAR FUNCIONES GLOBALES
// ================================================

window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.sortVehicles = sortVehicles;
window.openVehicleModal = openVehicleModal;
window.closeModal = closeModal;
window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.increaseYear = increaseYear;
window.decreaseYear = decreaseYear;

console.log('✅ Pauccars JavaScript V2 cargado correctamente');

// ... (resto de tu código anterior)

// Listener corregido para cerrar con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const vehicleModal = document.getElementById('vehicleModal');
        const budgetModal = document.getElementById('budgetModal');

        // Verificamos si los modales están visibles comparando el estilo display
        if (vehicleModal && vehicleModal.style.display === 'block') {
            closeModal(); // Nombre correcto de tu función de cierre
        }
        
        if (budgetModal && budgetModal.style.display === 'block') {
            closeBudgetModal(); // También cerramos el de presupuesto si está abierto
        }
    }
});