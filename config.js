// ================================================
// PAUCCARS - CONFIGURACIÓN GOOGLE SHEETS
// ================================================

const CONFIG = {
    // Google Sheets API
    SHEET_ID: '1JJmu6w7Z92C5dViKjK0fqwdI8j53o1sPIdg7HL4tj70',
    SHEET_NAME: 'Catalogo Autos',   // ← Renombrar pestaña en Sheets a este nombre
    API_KEY: 'AIzaSyAUKUadk5HfRwMNduVgqKqieHxsCfUwNAM',
    
    // URLs de API
    SHEETS_API_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
    
    // Configuración de imágenes
    IMAGE_WIDTH: 800,
    PLACEHOLDER_IMAGE: 'https://via.placeholder.com/800x600?text=Sin+Foto',
    
    // Actualización automática
    AUTO_REFRESH: false,
    REFRESH_INTERVAL: 300000  // 5 minutos
};

if (typeof window !== 'undefined') { window.CONFIG = CONFIG; }
console.log('✅ Configuración Pauccars cargada');