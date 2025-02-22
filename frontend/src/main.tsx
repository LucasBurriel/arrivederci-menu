import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import axios from 'axios'

// Configuración global de axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 