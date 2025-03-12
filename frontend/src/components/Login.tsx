import React, { useState, FormEvent, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  styled,
  CircularProgress,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';

// Estilos
const LoginContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const LoginForm = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

// Interfaces
interface LoginCredentials {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<boolean>(false);
  const navigate = useNavigate();

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    const checkExistingSession = async () => {
      // Si ya hay una sesión activa, redirigir al panel de administración
      if (await authService.verificarSesion()) {
        navigate('/admin');
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStorageError(false);
    
    try {
      console.log('API URL being used:', import.meta.env.VITE_API_URL);
      
      // 1. Realizar la solicitud de login sin cabeceras personalizadas que causen problemas CORS
      const response = await axios.post('/auth/login', credentials, {
        withCredentials: true
      });
      
      console.log('Respuesta del servidor:', response.data);
      
      // 2. Guardar el token usando el servicio de autenticación
      const tokenGuardado = authService.setToken(response.data.token || 'session-token');
      
      if (!tokenGuardado) {
        console.error('No se pudo guardar el token en ningún almacenamiento');
        setStorageError(true);
        setError('Error: Tu navegador está bloqueando el almacenamiento necesario para iniciar sesión. Por favor, verifica la configuración de privacidad o prueba con otro navegador.');
        setLoading(false);
        return;
      }
      
      // 3. Guardar información del usuario si está disponible
      if (response.data.usuario) {
        authService.setUser(response.data.usuario);
      }
      
      // 4. Verificar que la sesión se estableció correctamente
      const sesionVerificada = await authService.verificarSesion();
      
      if (sesionVerificada) {
        navigate('/admin');
      } else {
        setError('Error de autenticación: La sesión no se estableció correctamente');
        authService.logout(); // Limpiar cualquier información parcial
      }
    } catch (err) {
      console.error('Error completo:', err);
      const error = err as AxiosError<{ error: string }>;
      if (error.response) {
        console.error('Error del servidor:', error.response.data);
        setError(error.response.data.error || 'Error del servidor: ' + error.response.status);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
        setError('No se pudo conectar con el servidor');
      } else {
        console.error('Error de configuración:', error.message);
        setError('Error al configurar la petición: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer maxWidth="sm">
      <LoginPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar Sesión
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, width: '100%' }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {storageError && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2, width: '100%' }}
          >
            Tu navegador puede estar bloqueando cookies o almacenamiento local necesario para el inicio de sesión.
            <br />
            Recomendaciones:
            <ul>
              <li>Verifica la configuración de privacidad de tu navegador</li>
              <li>Desactiva el modo incógnito</li>
              <li>Prueba con otro navegador</li>
            </ul>
          </Alert>
        )}

        <LoginForm 
          component="form" 
          onSubmit={handleSubmit}
          role="form"
        >
          <TextField
            fullWidth
            label="Usuario"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
            disabled={loading}
            inputProps={{
              'aria-label': 'Usuario'
            }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            margin="normal"
            required
            disabled={loading}
            inputProps={{
              'aria-label': 'Contraseña'
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
        </LoginForm>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login; 