import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Menu from './components/Menu';
import Admin from './components/Admin';
import Login from './components/Login';
import axios from 'axios';

// Configurar axios para incluir credenciales en todas las peticiones
axios.defaults.withCredentials = true;

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 