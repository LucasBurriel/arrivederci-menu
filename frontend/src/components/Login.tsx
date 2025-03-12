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
      console.log('Iniciando proceso de login...');
      console.log('API URL configurada:', import.meta.env.VITE_API_URL);
      console.log('Axios baseURL:', axios.defaults.baseURL);
      
      // 1. Realizar la solicitud de login sin cabeceras personalizadas que causen problemas CORS
      const response = await axios.post('/auth/login', credentials, {
        withCredentials: true
      });
      
      console.log('Respuesta del servidor login (completa):', response);
      console.log('Respuesta del servidor login (datos):', response.data);
      console.log('Respuesta del servidor login (headers):', response.headers);
      console.log('Respuesta del servidor login (status):', response.status);
      
      // SOLUCIÓN TEMPORAL: El backend no proporciona un token
      // Verificar si la respuesta indica login exitoso
      const isLoginSuccessful = 
        response.status === 200 && 
        (response.data.mensaje === "Login exitoso" || 
         response.data.message === "Login exitoso");
      
      if (isLoginSuccessful) {
        console.log('Login exitoso detectado, generando token temporal');
        
        // Crear un token temporal basado en el nombre de usuario
        // Esto es solo una solución temporal, no segura para producción
        const tempToken = btoa(`${credentials.username}:${Date.now()}`);
        
        // Guardar el token temporal
        const tokenGuardado = authService.setToken(tempToken);
        
        if (!tokenGuardado) {
          console.error('No se pudo guardar el token en ningún almacenamiento');
          setStorageError(true);
          setError('Error: Tu navegador está bloqueando el almacenamiento necesario para iniciar sesión. Por favor, verifica la configuración de privacidad o prueba con otro navegador.');
          setLoading(false);
          return;
        }
        
        // Guardar información del usuario
        authService.setUser({ username: credentials.username });
        
        // Navegar directamente a la sección de administración
        navigate('/admin');
        return;
      }
      
      // Verificar si hay un token en la respuesta (código original)
      if (!response.data.token && !response.data.session_id) {
        console.error('No se recibió un token o identificador de sesión en la respuesta');
        setError('Error: El servidor no devolvió un token de autenticación. Contacta al administrador.');
        setLoading(false);
        return;
      }
      
      // 2. Guardar el token usando el servicio de autenticación
      // Si no hay token, usamos session_id o un valor predeterminado
      const tokenToSave = response.data.token || response.data.session_id || 'session-token';
      console.log('Token a guardar:', tokenToSave);
      
      const tokenGuardado = authService.setToken(tokenToSave);
      
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
      console.log('Verificando sesión después del login...');
      const sesionVerificada = await authService.verificarSesion();
      console.log('Resultado verificación sesión:', sesionVerificada);
      
      if (sesionVerificada) {
        navigate('/admin');
      } else {
        setError('Error de autenticación: La sesión no se estableció correctamente. Intenta recargar la página o usar otro navegador.');
        authService.logout(); // Limpiar cualquier información parcial
      }
    } catch (err) {
      console.error('Error completo:', err);
      const error = err as AxiosError<{ error: string }>;
      if (error.response) {
        console.error('Error del servidor:', error.response.data);
        console.error('Status:', error.response.status, error.response.statusText);
        setError(error.response.data.error || `Error del servidor: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No se recibió respuesta:', error.request);
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
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