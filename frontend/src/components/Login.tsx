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
      await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true
      });
      navigate('/admin');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || 'Error al iniciar sesión');
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