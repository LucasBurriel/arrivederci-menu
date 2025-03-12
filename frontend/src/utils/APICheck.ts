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

  // Comprobar si podemos hacer ping al servidor
  try {
    const res = await fetch(`${API_URL ? API_URL : ''}/ping`, {
      method: 'GET',
      mode: 'cors'
    });
    if (res.ok) {
      console.log('✅ Conexión al API exitosa');
    } else {
      console.log('❌ Error conectando al API. Status:', res.status);
    }
  } catch (e) {
    console.error('❌ Error al intentar conectar con el API:', e);
  }
  
  console.log('=========================');
}

export default checkAPIConnection; 