import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Collapse, Alert } from '@mui/material';
import axios from 'axios';
import authService from '../services/AuthService';

const Debug: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [apiURL, setApiURL] = useState<string>('');
  const [axiosBaseURL, setAxiosBaseURL] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [corsStatus, setCorsStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [corsMessage, setCorsMessage] = useState<string>('');

  useEffect(() => {
    // Obtener información de configuración
    setApiURL(import.meta.env.VITE_API_URL || 'No configurado');
    setAxiosBaseURL(axios.defaults.baseURL || 'No configurado');
    setToken(authService.getToken());

    // Verificar CORS
    checkCORS();
  }, []);

  const checkCORS = async () => {
    try {
      setCorsStatus('checking');
      setCorsMessage('Verificando configuración CORS...');
      
      const response = await fetch(apiURL, {
        method: 'OPTIONS', 
        mode: 'cors'
      });
      
      // Verificar los headers de CORS
      const corsHeaders = {
        allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
        allowCredentials: response.headers.get('Access-Control-Allow-Credentials'),
        allowMethods: response.headers.get('Access-Control-Allow-Methods'),
        allowHeaders: response.headers.get('Access-Control-Allow-Headers')
      };
      
      if (corsHeaders.allowOrigin) {
        setCorsStatus('success');
        setCorsMessage(`CORS configurado correctamente: ${JSON.stringify(corsHeaders)}`);
      } else {
        setCorsStatus('error');
        setCorsMessage('No se encontraron headers de CORS en la respuesta');
      }
    } catch (error) {
      setCorsStatus('error');
      setCorsMessage(`Error al verificar CORS: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    alert('Almacenamiento local limpiado. La página se recargará.');
    window.location.reload();
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        m: 2, 
        p: expanded ? 2 : 1, 
        zIndex: 9999,
        maxWidth: expanded ? 400 : 'auto', 
        opacity: 0.9 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 2 : 0 }}>
        <Typography variant="subtitle2" color="primary">
          Diagnóstico
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </Box>
      
      <Collapse in={expanded}>
        <Alert severity="info" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>API URL:</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{apiURL}</Typography>
          
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Axios BaseURL:</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{axiosBaseURL}</Typography>
          
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Token almacenado:</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {token || 'No hay token almacenado'}
          </Typography>
          
          <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>CORS Status:</Typography>
          <Typography variant="body2">
            {corsStatus === 'checking' && '⏳ Verificando...'}
            {corsStatus === 'success' && '✅ OK'}
            {corsStatus === 'error' && '❌ Error'}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{corsMessage}</Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              size="small" 
              variant="contained" 
              color="warning" 
              onClick={clearLocalStorage}
              sx={{ mr: 1 }}
            >
              Limpiar Storage
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={checkCORS}
            >
              Verificar CORS
            </Button>
          </Box>
        </Alert>
      </Collapse>
    </Paper>
  );
};

export default Debug; 