// Utilidad para verificar la conexión API
import axios from 'axios';

/**
 * Verifica que la URL del API es correcta e imprime información de diagnóstico
 */
export async function checkAPIConnection() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  console.log('=== VERIFICACIÓN DE API ===');
  console.log('URL base configurada:', API_URL);
  
  // Comprobar si el axios está configurado correctamente
  try {
    console.log('Configuración actual de axios:');
    console.log('- BaseURL:', axios.defaults.baseURL);
    console.log('- withCredentials:', axios.defaults.withCredentials);
  } catch (e) {
    console.error('No se pudo acceder a la configuración de axios');
  }

  // Probar si la URL del API es accesible (prueba directa con fetch)
  try {
    console.log('Probando conexión directa a:', API_URL);
    const directRes = await fetch(API_URL, {
      method: 'GET',
      mode: 'cors'
    });
    console.log('Respuesta de conexión directa:', directRes.status, directRes.statusText);
    
    // Si la respuesta es OK, intentar leer el contenido
    if (directRes.ok) {
      try {
        const text = await directRes.text();
        console.log('Respuesta del servidor (primeros 100 caracteres):', text.substring(0, 100));
      } catch (e) {
        console.error('Error al leer la respuesta:', e);
      }
    }
  } catch (e) {
    console.error('Error al probar conexión directa:', e);
  }

  // Probar un endpoint real de autenticación
  try {
    console.log('Probando endpoint de verificación de autenticación...');
    const authCheckRes = await fetch(`${API_URL}/auth/check`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });
    console.log('Respuesta de auth/check:', authCheckRes.status, authCheckRes.statusText);
    
    if (authCheckRes.ok) {
      try {
        const text = await authCheckRes.text();
        console.log('Respuesta de auth/check (texto):', text);
        
        try {
          const json = JSON.parse(text);
          console.log('Respuesta de auth/check (JSON):', json);
        } catch (e) {
          console.error('Error al parsear JSON de auth/check:', e);
        }
      } catch (e) {
        console.error('Error al leer respuesta de auth/check:', e);
      }
    }
  } catch (e) {
    console.error('Error al probar endpoint de autenticación:', e);
  }
  
  console.log('=========================');
}

export default checkAPIConnection; 