import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Tabs,
  Tab,
  styled,
  Alert,
  CircularProgress,
  Theme,
} from '@mui/material';
import axios from 'axios';
import logo from '../assets/Logo4.svg';
import background from '../assets/background.jpg';

// Constantes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PLACEHOLDER_IMAGE = '/placeholder-food.jpg';

// Interfaces
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagen_url: string;
}

interface Categoria {
  id: number;
  nombre: string;
  valor: string;
}

// Estilos actualizados
const HeroSection = styled(Box)(({ theme }: { theme: Theme }) => ({
  height: '100vh',
  width: '100%',
  position: 'relative',
  backgroundImage: `url(${background})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
}));

const AnimatedContainer = styled(Container)(() => ({
  transition: 'all 0.5s ease-out',
  opacity: 1,
}));

const AnimatedTabs = styled(Box)(() => ({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: '32px',
  transition: 'all 0.5s ease-out',
  opacity: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const AnimatedCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.5s ease-out',
  opacity: 1,
}));

const HeroOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  animation: 'fadeIn 1s ease-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
});

const LogoImage = styled('img')({
  width: '90%',
  maxWidth: '400px',
  height: 'auto',
  position: 'relative',
  zIndex: 1,
  filter: 'brightness(0) invert(1) drop-shadow(0px 0px 10px rgba(255,255,255,0.5))',
  padding: '20px',
  transition: 'all 0.5s ease-out',
});

const StyledTabs = styled(Tabs)(() => ({
  '& .MuiTab-root': {
    color: '#4a2511',
    minWidth: 'auto',
    '&.Mui-selected': {
      color: '#c9a45c',
    },
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#c9a45c',
  },
  '& .MuiTabs-scrollButtons': {
    color: '#4a2511',
  },
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
});

const Menu: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productosRes, categoriasRes] = await Promise.all([
          axios.get(`${API_URL}/productos`),
          axios.get(`${API_URL}/categorias`)
        ]);
        setProductos(productosRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar el menú. Por favor, intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const productosFiltrados = useMemo(() => {
    return categoriaActiva === 'todos'
      ? productos.filter(p => p.disponible)
      : productos.filter(p => p.categoria === categoriaActiva && p.disponible);
  }, [productos, categoriaActiva]);

  const handleImageError = (productoId: number) => {
    setImageLoadErrors(prev => new Set([...prev, productoId]));
  };

  if (loading) {
    return (
      <>
        <HeroSection>
          <HeroOverlay />
          <LogoImage src={logo} alt="Arrivederci Café Bar" />
        </HeroSection>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        </Container>
      </>
    );
  }

  return (
    <>
      <HeroSection>
        <HeroOverlay />
        <LogoImage 
          src={logo} 
          alt="Arrivederci Café Bar" 
          style={{
            opacity: scrollDirection === 'up' ? 1 : 0,
            transform: scrollDirection === 'up' 
              ? 'scale(1) translateY(0)' 
              : 'scale(0.95) translateY(-30px)',
          }}
        />
      </HeroSection>

      <AnimatedContainer maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <AnimatedTabs>
          <StyledTabs
            value={categoriaActiva}
            onChange={(_, newValue) => setCategoriaActiva(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Todos" value="todos" />
            {categorias.map((cat) => (
              <Tab key={cat.valor} label={cat.nombre} value={cat.valor} />
            ))}
          </StyledTabs>
        </AnimatedTabs>

        <Grid container spacing={4}>
          {productosFiltrados.map((producto) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <AnimatedCard>
                <CardMedia
                  component="img"
                  height="200"
                  image={imageLoadErrors.has(producto.id) ? PLACEHOLDER_IMAGE : producto.imagen_url || PLACEHOLDER_IMAGE}
                  alt={producto.nombre}
                  onError={() => handleImageError(producto.id)}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: 'grey.100',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {producto.nombre}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      minHeight: '3em',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {producto.descripcion}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    sx={{ 
                      fontWeight: 'bold',
                      display: 'inline-block',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    ${producto.precio.toFixed(2)}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </AnimatedContainer>
    </>
  );
};

export default Menu; 