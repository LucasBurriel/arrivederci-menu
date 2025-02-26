import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  GlobalStyles,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import logo from '../assets/Logo4.svg';
import background from '../assets/background.jpg';

// Constantes
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PLACEHOLDER_IMAGE = '/placeholder-food.jpg';
// Agrego un log para depuración
console.log('API_URL utilizada:', API_URL);

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

const AnimatedContainer = styled(Container)<{ $scrollDirection: 'up' | 'down' }>(({ $scrollDirection }) => ({
  transition: 'all 0.5s ease-out',
  opacity: 1,
  transform: $scrollDirection === 'up' 
    ? 'translateY(0)' 
    : 'translateY(10px)',
}));

const AnimatedTabs = styled(Box)<{ $scrollDirection: 'up' | 'down' }>(({ $scrollDirection }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: '32px',
  transition: 'all 0.5s ease-out',
  opacity: 1,
  transform: $scrollDirection === 'up' 
    ? 'translateX(0)' 
    : 'translateX(-10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const StaticTabs = styled(Box)({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: '32px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '8px',
  borderRadius: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
});

const AnimatedCard = styled(Card)<{ $scrollDirection: 'up' | 'down'; $index: number }>(
  ({ $scrollDirection, $index }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.5s ease-out',
    transitionDelay: `${$index * 0.1}s`,
    opacity: 1,
    transform: $scrollDirection === 'up'
      ? 'translateX(0)'
      : 'translateX(-10px)'
  })
);

const StaticCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

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

// Estilo global para deshabilitar efectos en dispositivos móviles
const noHoverStyles = {
  '@media (hover: none)': {
    '& *:hover': {
      transform: 'none !important',
      boxShadow: 'none !important',
      backgroundColor: 'transparent !important',
      color: 'inherit !important',
      transition: 'none !important',
    }
  }
};

// Componente para renderizar una tarjeta de producto (optimizado)
const ProductCard: React.FC<{
  producto: Producto;
  index?: number;
  scrollDirection?: 'up' | 'down';
  isMobile: boolean;
  onImageError: (id: number) => void;
  imageLoadErrors: Set<number>;
}> = React.memo(({ 
  producto, 
  index = 0, 
  scrollDirection = 'up', 
  isMobile, 
  onImageError,
  imageLoadErrors
}) => {
  const imageSrc = imageLoadErrors.has(producto.id) 
    ? PLACEHOLDER_IMAGE 
    : producto.imagen_url || PLACEHOLDER_IMAGE;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleError = useCallback(() => {
    onImageError(producto.id);
  }, [producto.id, onImageError]);
  
  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Usar Intersection Observer para cargar imágenes solo cuando sean visibles
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Desconectar después de detectar
          observer.disconnect();
        }
      },
      { 
        rootMargin: '200px', // Cargar un poco antes de que sea visible
        threshold: 0.01 
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Renderizado condicional basado en isMobile
  if (isMobile) {
    return (
      <StaticCard>
        <Box
          ref={imageRef}
          sx={{
            height: '200px',
            backgroundColor: 'grey.100',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Placeholder mientras la imagen carga */}
          {(!isVisible || !imageLoaded) && (
            <Box 
              sx={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.1)',
                position: 'absolute',
              }} 
            />
          )}
          
          {/* Imagen real, cargada solo cuando está en viewport */}
          {isVisible && (
            <CardMedia
              component="img"
              height="200"
              image={imageSrc}
              alt={producto.nombre}
              onError={handleError}
              onLoad={handleImageLoaded}
              sx={{
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </Box>
        
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
            aria-label={`Precio: ${producto.precio.toFixed(2)} euros`}
          >
            ${producto.precio.toFixed(2)}
          </Typography>
        </CardContent>
      </StaticCard>
    );
  }

  return (
    <AnimatedCard $scrollDirection={scrollDirection} $index={index}>
      <Box
        ref={imageRef}
        sx={{
          height: '200px',
          backgroundColor: 'grey.100',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Placeholder mientras la imagen carga */}
        {(!isVisible || !imageLoaded) && (
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.1)',
              position: 'absolute',
            }}
          />
        )}
        
        {/* Imagen real, cargada solo cuando está en viewport */}
        {isVisible && (
          <CardMedia
            component="img"
            height="200"
            image={imageSrc}
            alt={producto.nombre}
            onError={handleError}
            onLoad={handleImageLoaded}
            sx={{
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        )}
      </Box>
      
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
          aria-label={`Precio: ${producto.precio.toFixed(2)} euros`}
        >
          ${producto.precio.toFixed(2)}
        </Typography>
      </CardContent>
    </AnimatedCard>
  );
});

// Componente principal
const Menu: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  
  // Verificación de capacidad hover usando useMediaQuery en lugar de evento resize
  const isMobile = useMediaQuery('(hover: none)');
  
  // Evitar recreación de la función en cada renderizado
  const handleImageError = useCallback((productoId: number) => {
    setImageLoadErrors(prev => new Set([...prev, productoId]));
  }, []);

  // Referencia para cancelar solicitudes
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cargar datos con mejor manejo de errores y cancelación
  const cargarDatos = useCallback(async () => {
    // Cancelar solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo controlador para esta solicitud
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando solicitud al backend:', `${API_URL}/productos`);
      
      // Intento primero obtener productos para identificar el problema específico
      const productosRes = await axios.get(`${API_URL}/productos`, {
        signal: controller.signal,
        timeout: 15000 // Aumentar timeout a 15 segundos
      });
      
      // Si llegamos aquí, la primera solicitud funcionó, intentamos la segunda
      const categoriasRes = await axios.get(`${API_URL}/categorias`, {
        signal: controller.signal,
        timeout: 15000
      });
      
      // Verificar si se abortó mientras esperábamos
      if (controller.signal.aborted) return;
      
      console.log('Datos recibidos:', { productos: productosRes.data.length, categorias: categoriasRes.data.length });
      
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (err) {
      // Verificar si se abortó
      if (axios.isCancel(err)) {
        console.log('Solicitud cancelada');
        return;
      }
      
      // Log detallado del error para diagnóstico
      console.error('Error al cargar datos:', err);
      if (axios.isAxiosError(err)) {
        console.error('Detalles del error Axios:', {
          mensaje: err.message,
          url: err.config?.url,
          codigo: err.code,
          respuesta: err.response?.data,
          estado: err.response?.status
        });
        
        // Mensajes de error más específicos según el problema
        if (err.code === 'ECONNABORTED') {
          setError('El servidor está tardando demasiado en responder. Por favor, intente nuevamente más tarde.');
        } else if (err.response?.status === 404) {
          setError('No se pudo encontrar el recurso solicitado. Verifique la configuración del API.');
        } else if (err.response?.status === 403 || err.response?.status === 401) {
          setError('No tiene acceso a este recurso. Por favor, verifique sus credenciales.');
        } else if (err.response && err.response.status >= 500) {
          setError('Error en el servidor. El equipo técnico ha sido notificado.');
        } else {
          setError('Error al cargar el menú. Por favor, intente nuevamente más tarde.');
        }
      } else {
        setError('Error al cargar el menú. Por favor, intente nuevamente más tarde.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Efecto para cargar datos con limpieza adecuada
  useEffect(() => {
    cargarDatos();
    
    return () => {
      // Cancelar solicitud al desmontar
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cargarDatos]);

  // Optimizar manejo de scroll con throttling
  useEffect(() => {
    if (isMobile) return; // No agregar eventos en móviles
    
    let ticking = false;
    let lastKnownScrollY = window.scrollY;
    
    const handleScroll = () => {
      lastKnownScrollY = window.scrollY;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lastKnownScrollY > lastScrollY) {
            setScrollDirection('down');
          } else {
            setScrollDirection('up');
          }
          
          setLastScrollY(lastKnownScrollY);
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  // Optimizar filtrado de productos
  const productosFiltrados = useMemo(() => {
    return categoriaActiva === 'todos'
      ? productos.filter(p => p.disponible)
      : productos.filter(p => p.categoria === categoriaActiva && p.disponible);
  }, [productos, categoriaActiva]);
  
  // Manejar cambio de categoría
  const handleCategoriaChange = useCallback((
    _: React.SyntheticEvent, 
    newValue: string
  ) => {
    setCategoriaActiva(newValue);
  }, []);

  // Renderizado condicional para estado de carga
  if (loading) {
    return (
      <>
        <GlobalStyles styles={noHoverStyles} />
        <HeroSection>
          <HeroOverlay />
          <LogoImage src={logo} alt="Arrivederci Café Bar" />
        </HeroSection>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LoadingContainer>
            <CircularProgress aria-label="Cargando el menú" />
          </LoadingContainer>
        </Container>
      </>
    );
  }

  // Renderizado común para ambas versiones
  const categoryTabs = (
    <StyledTabs
      value={categoriaActiva}
      onChange={handleCategoriaChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Categorías de productos"
      role="tablist"
    >
      <Tab label="Todos" value="todos" role="tab" aria-selected={categoriaActiva === "todos"} />
      {categorias.map((cat) => (
        <Tab 
          key={cat.valor} 
          label={cat.nombre} 
          value={cat.valor} 
          role="tab" 
          aria-selected={categoriaActiva === cat.valor}
        />
      ))}
    </StyledTabs>
  );

  // Renderizado para móviles (sin animaciones)
  if (isMobile) {
    return (
      <>
        <GlobalStyles styles={noHoverStyles} />
        <HeroSection role="banner">
          <HeroOverlay />
          <LogoImage 
            src={logo}
            alt="Arrivederci Café Bar"
          />
        </HeroSection>

        <Container maxWidth="lg" sx={{ py: 4 }} role="main">
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              onClose={() => setError(null)}
              aria-live="assertive"
            >
              {error}
            </Alert>
          )}

          <StaticTabs>
            {categoryTabs}
          </StaticTabs>

          <Grid container spacing={4} aria-label="Lista de productos" role="region">
            {productosFiltrados.map((producto) => (
              <Grid item xs={12} sm={6} md={4} key={producto.id}>
                <ProductCard 
                  producto={producto}
                  isMobile={true}
                  onImageError={handleImageError}
                  imageLoadErrors={imageLoadErrors}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </>
    );
  }

  // Renderizado para escritorio (con animaciones)
  return (
    <>
      <GlobalStyles styles={noHoverStyles} />
      <HeroSection role="banner">
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

      <AnimatedContainer maxWidth="lg" sx={{ py: 4 }} $scrollDirection={scrollDirection} role="main">
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={() => setError(null)}
            aria-live="assertive"
          >
            {error}
          </Alert>
        )}

        <AnimatedTabs $scrollDirection={scrollDirection}>
          {categoryTabs}
        </AnimatedTabs>

        <Grid container spacing={4} aria-label="Lista de productos" role="region">
          {productosFiltrados.map((producto, index) => (
            <Grid item xs={12} sm={6} md={4} key={producto.id}>
              <ProductCard 
                producto={producto}
                index={index}
                scrollDirection={scrollDirection}
                isMobile={false}
                onImageError={handleImageError}
                imageLoadErrors={imageLoadErrors}
              />
            </Grid>
          ))}
        </Grid>
      </AnimatedContainer>
    </>
  );
};

export default Menu; 