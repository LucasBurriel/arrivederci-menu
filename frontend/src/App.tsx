import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import React, { useEffect, useState } from 'react';
import Menu from './components/Menu';
import Admin from './components/Admin';
import Login from './components/Login';
import axios from 'axios';
import authService from './services/AuthService';
import checkAPIConnection from './utils/APICheck';

// Configurar axios para incluir credenciales en todas las peticiones
axios.defaults.withCredentials = true;

// Eliminando el interceptor que estaba causando problemas CORS
// Las cabeceras 'Cache-Control' no están permitidas en la respuesta de preflight

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a2511', // Color café oscuro
    },
    secondary: {
      main: '#8b4513', // Color café más claro
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
    },
  },
});

// Componente para rutas protegidas
interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const autenticado = await authService.verificarSesion();
        setIsAuthenticated(autenticado);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verificarAutenticacion();
  }, []);
  
  // Mostrar algún indicador de carga mientras verificamos
  if (isLoading) {
    return <div>Verificando sesión...</div>;
  }
  
  if (isAuthenticated === false) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
};

function App() {
  useEffect(() => {
    // Verificar la conexión con el API al iniciar la aplicación
    checkAPIConnection();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Menu />} />
          
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 