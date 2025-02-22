import React, { useState, FormEvent } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  styled,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

// Constantes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      console.log('Intentando login con URL:', API_URL);
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true
      });
      console.log('Respuesta del servidor:', response.data);
      
      // Verificar que el login fue exitoso antes de redirigir
      const checkResponse = await axios.get(`${API_URL}/auth/check`, {
        withCredentials: true
      });
      console.log('Verificación de autenticación:', checkResponse.data);
      
      if (checkResponse.data.autenticado) {
        navigate('/admin');
      } else {
        setError('Error de autenticación: La sesión no se estableció correctamente');
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

        <LoginForm component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Usuario"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar Sesión
          </Button>
        </LoginForm>
      </LoginPaper>
    </LoginContainer>
  );
};

export default Login; 