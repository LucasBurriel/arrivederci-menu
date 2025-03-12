import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'

// Configuración global de axios
const apiUrl = import.meta.env.VITE_API_URL;
console.log('⚙️ Configuración inicial de axios - API URL:', apiUrl);

if (apiUrl) {
  axios.defaults.baseURL = apiUrl;
  console.log('✅ axios.defaults.baseURL configurado como:', axios.defaults.baseURL);
} else {
  console.warn('⚠️ VITE_API_URL no está definido. La API podría no funcionar correctamente.');
}

// Habilitar credenciales (cookies) en las peticiones
axios.defaults.withCredentials = true;
console.log('✅ axios.defaults.withCredentials configurado como:', axios.defaults.withCredentials);

// Agregar un interceptor para depurar las peticiones
axios.interceptors.request.use(
  (config) => {
    console.log(`📤 Enviando ${config.method?.toUpperCase() || 'REQUEST'} a ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Agregar un interceptor para depurar las respuestas
axios.interceptors.response.use(
  (response) => {
    console.log(`📥 Respuesta ${response.status} de ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ Error ${error.response.status} de ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No se recibió respuesta del servidor:', error.request);
    } else {
      console.error('❌ Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 