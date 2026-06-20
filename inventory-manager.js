// ================================================
// GRUPO PAUCCAR'S — Gestor de Inventario V7
// 19 columnas Google Sheets
// A:Tipo B:Marca C:Modelo D:Año E:Precio F:Kilometraje
// G:Transmision H:Combustible I:Foto1 J:Foto2 K:Foto3
// L:Foto4 M:Foto5 N:Color O:Ciudad P:Placa Q:Soat
// R:Tecnomecanica S:Ubicacion
// ================================================

class InventoryManager {
    constructor(config) {
        this.config = config;
        this.vehicles = [];
        this.isLoading = false;
    }

    // ── Convierte link de Google Drive a URL de imagen optimizada
    convertDriveLink(driveUrl, width = this.config.IMAGE_WIDTH || 800) {
        if (!driveUrl || driveUrl.toString().trim() === '') return null;

        const url = driveUrl.toString().trim();

        if (url.includes('drive.google.com')) {
            try {
                // Formato: /d/FILE_ID/
                const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (m && m[1]) {
                    return `https://lh3.googleusercontent.com/d/${m[1]}=w${width}`;
                }
                // Formato: id=FILE_ID
                const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (m2 && m2[1]) {
                    return `https://lh3.googleusercontent.com/d/${m2[1]}=w${width}`;
                }
            } catch(e) { console.warn('Error link Drive:', e); }
        }

        // URL directa (no Drive)
        if (url.startsWith('http')) return url;
        return null;
    }

    // ── Procesa hasta 5 fotos (columnas I–M = índices 8–12)
    processPhotos(row) {
        const images = [];
        for (let i = 8; i <= 12; i++) {
            if (row[i]) {
                const url = this.convertDriveLink(row[i]);
                if (url) images.push(url);
            }
        }
        if (images.length === 0) {
            images.push(this.config.PLACEHOLDER_IMAGE ||
                'https://via.placeholder.com/800x500/0D1230/1464F0?text=Sin+Foto');
        }
        return images;
    }

    // ── Normalizar texto (capitalizar primer letra)
    cap(str) {
        if (!str) return '';
        const s = str.toString().trim();
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    }

    // ── Normalizar booleano / estado (SOAT, Tecnomecánica)
    // Acepta: si/vigente/yes → Vigente | no/vencido → Vencido | fecha → muestra la fecha
    normalizeEstado(val) {
        if (!val || val.toString().trim() === '') return 'N/A';
        const v = val.toString().toLowerCase().trim();

        // Palabras clave
        if (['si','sí','yes','1','true','vigente','ok'].includes(v)) return 'Vigente';
        if (['no','0','false','vencido','vence','expirado'].includes(v)) return 'Vencido';

        // Si es una fecha (ej: 23/03/2026 o 2026-03-23)
        const fechaRegex = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{2}[\/\-]\d{2})$/;
        if (fechaRegex.test(v)) {
            // Mostrar la fecha tal cual — indica vencimiento
            return val.toString().trim();
        }

        return val.toString().trim();
    }

    // ── Carga inventario desde Google Sheets
    async loadInventory() {
        this.isLoading = true;
        console.log('📊 Cargando inventario Pauccar\'s...');

        try {
            const sheetName = encodeURIComponent(this.config.SHEET_NAME);
            const url = `${this.config.SHEETS_API_URL}/${this.config.SHEET_ID}/values/${sheetName}?key=${this.config.API_KEY}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);

            const data = await res.json();

            if (!data.values || data.values.length < 2) {
                throw new Error('La hoja de cálculo no tiene datos o está vacía.');
            }

            console.log(`📋 ${data.values.length - 1} filas leídas`);

            // ── Mapa de columnas (base 0):
            // A=0  Tipo
            // B=1  Marca
            // C=2  Modelo
            // D=3  Año
            // E=4  Precio
            // F=5  Kilometraje
            // G=6  Transmision
            // H=7  Combustible
            // I=8  Foto1
            // J=9  Foto2
            // K=10 Foto3
            // L=11 Foto4
            // M=12 Foto5
            // N=13 Color
            // O=14 Ciudad
            // P=15 Placa
            // Q=16 Soat
            // R=17 Tecnomecanica
            // S=18 Ubicacion

            this.vehicles = data.values.slice(4).map((row, idx) => {
                const images = this.processPhotos(row);

                const precio = parseInt((row[4] || '0').toString().replace(/[^\d]/g, '')) || 0;
                const km     = parseInt((row[5] || '0').toString().replace(/[^\d]/g, '')) || 0;
                const anio   = parseInt(row[3]) || new Date().getFullYear();

                return {
                    id:             idx + 1,
                    // Datos principales
                    type:           (row[0] || 'sedan').toLowerCase().trim(),
                    brand:          (row[1] || 'Sin marca').trim(),
                    model:          (row[2] || 'Sin modelo').trim(),
                    name:           `${(row[1]||'').trim()} ${(row[2]||'').trim()}`.trim(),
                    year:           anio,
                    price:          precio,
                    km:             km,
                    transmission:   this.cap(row[6]) || 'Manual',
                    fuel:           this.cap(row[7]) || 'Gasolina',
                    // Fotos
                    images:         images,
                    image:          images[0],
                    // Datos adicionales
                    color:          this.cap(row[13]) || 'N/A',
                    ciudad:         this.cap(row[14]) || 'Cali',
                    placa:          (row[15] || '').toString().toUpperCase().trim(),
                    soat:           this.normalizeEstado(row[16]),
                    tecnomecanica:  this.normalizeEstado(row[17]),
                    ubicacion:      (row[18] || '').trim(),
                    // Estado general — columna T del Sheets (índice 19)
                    // En el Sheets escribir: Disponible, Vendido, Reservado
                    estado: (row[19] || row[18] || 'Disponible').trim(),
                    // Videos — columnas U (índice 20) y V (índice 21)
                    video1: (row[20] || '').trim(),
                    video2: (row[21] || '').trim(),
                };
            });

            // Filtrar filas vacías
            this.vehicles = this.vehicles.filter(v =>
                v.brand !== 'Sin marca' &&
                v.model !== 'Sin modelo' &&
                v.price > 0
            );

            console.log(`✅ ${this.vehicles.length} vehículos cargados`);
            this.isLoading = false;
            return this.vehicles;

        } catch (err) {
            console.error('❌ Error inventario:', err);
            this.isLoading = false;
            throw err;
        }
    }

    // ── Obtener vehículo por ID
    getVehicleById(id) {
        return this.vehicles.find(v => v.id === id) || null;
    }

    // ── Filtrar vehículos
    filterVehicles(filters) {
        return this.vehicles.filter(v => {
            if (filters.type  && v.type  !== filters.type)              return false;
            if (filters.brand && v.brand !== filters.brand)             return false;
            if (filters.model && !v.model.toLowerCase().includes(filters.model)) return false;
            if (filters.year  && v.year.toString() !== filters.year)    return false;
            if (filters.km    && v.km > parseInt(filters.km))           return false;
            if (filters.fuel  && v.fuel.toLowerCase() !== filters.fuel) return false;
            return true;
        });
    }

    // ── Auto-refresh
    startAutoRefresh() {
        if (this.config.AUTO_REFRESH) {
            setInterval(() => this.loadInventory(), this.config.REFRESH_INTERVAL || 300000);
        }
    }
}

if (typeof window !== 'undefined') window.InventoryManager = InventoryManager;
console.log('✅ InventoryManager V7 — 19 columnas listo');