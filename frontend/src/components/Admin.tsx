import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Typography,
  Alert,
  styled,
  Snackbar,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Estilos
const AdminContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const TabBox = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

// Componentes
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Admin: React.FC = () => {
  // Estado
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Partial<Producto>>({});
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', valor: '' });
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');
  const [tabActiva, setTabActiva] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  // Funciones
  const verificarAutenticacion = useCallback(async () => {
    try {
      // Usar el servicio de autenticación para verificar la sesión
      const autenticado = await authService.verificarSesion();
      
      if (!autenticado) {
        console.log('No autenticado, redirigiendo a login');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      navigate('/login');
    }
  }, [navigate]);

  const cargarDatos = useCallback(async () => {
    console.log('API URL being used:', import.meta.env.VITE_API_URL);
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        axios.get('/productos'),
        axios.get('/categorias')
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  }, []);

  useEffect(() => {
    verificarAutenticacion();
    cargarDatos();
  }, [verificarAutenticacion, cargarDatos]);

  const handleLogout = async () => {
    try {
      // Simplificando la petición para evitar problemas de CORS
      await axios.post('/auth/logout', {}, { 
        withCredentials: true
      });
      
      // Luego limpiar el almacenamiento local
      authService.logout();
      
      // Finalmente redirigir al login
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Incluso si hay un error, intentar limpiar el almacenamiento local
      authService.logout();
      navigate('/login');
    }
  };

  const handleOpenDialog = (modo: 'crear' | 'editar', producto?: Producto) => {
    setModo(modo);
    setProductoEditando(producto || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProductoEditando({});
  };

  const handleGuardar = async () => {
    try {
      // Validar campos requeridos en el frontend
      if (!productoEditando.nombre || !productoEditando.descripcion || 
          !productoEditando.precio || !productoEditando.categoria) {
        const camposFaltantes = [];
        if (!productoEditando.nombre) camposFaltantes.push('nombre');
        if (!productoEditando.descripcion) camposFaltantes.push('descripción');
        if (!productoEditando.precio) camposFaltantes.push('precio');
        if (!productoEditando.categoria) camposFaltantes.push('categoría');
        
        mostrarError(`Por favor completa los siguientes campos: ${camposFaltantes.join(', ')}`);
        return;
      }

      if (modo === 'crear') {
        await axios.post('/productos', productoEditando);
      } else {
        await axios.put(`/productos/${productoEditando.id}`, productoEditando);
      }
      handleCloseDialog();
      cargarDatos();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        mostrarError(err.response?.data?.error || 'Error al guardar el producto');
      } else {
        mostrarError('Error al guardar el producto');
      }
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`/productos/${id}`);
        cargarDatos();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          mostrarError(err.response?.data?.error || 'Error al eliminar el producto');
        } else {
          mostrarError('Error al eliminar el producto');
        }
      }
    }
  };

  const handleGuardarCategoria = async () => {
    try {
      await axios.post('/categorias', nuevaCategoria);
      setOpenCategoriaDialog(false);
      setNuevaCategoria({ nombre: '', valor: '' });
      cargarDatos();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        mostrarError(err.response?.data?.error || 'Error al crear la categoría');
      } else {
        mostrarError('Error al crear la categoría');
      }
    }
  };

  const handleEliminarCategoria = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await axios.delete(`/categorias/${id}`);
        cargarDatos();
      } catch (err) {
        if (axios.isAxiosError(err)) {
          mostrarError(err.response?.data?.error || 'Error al eliminar la categoría');
        } else {
          mostrarError('Error al eliminar la categoría');
        }
      }
    }
  };

  const mostrarError = (mensaje: string) => {
    setErrorMessage(mensaje);
    setOpenSnackbar(true);
  };

  return (
    <AdminContainer maxWidth="lg">
      <HeaderBox>
        <Typography variant="h4" component="h1">
          Panel de Administración
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </HeaderBox>

      <TabBox>
        <Tabs value={tabActiva} onChange={(_, newValue) => setTabActiva(newValue)}>
          <Tab label="Productos" />
          <Tab label="Categorías" />
        </Tabs>
      </TabBox>

      <TabPanel value={tabActiva} index={0}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog('crear')}
          sx={{ mb: 3 }}
        >
          Agregar Producto
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Disponible</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell>${producto.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    {categorias.find(c => c.valor === producto.categoria)?.nombre || producto.categoria}
                  </TableCell>
                  <TableCell>{producto.disponible ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <ActionButton
                      color="primary"
                      onClick={() => handleOpenDialog('editar', producto)}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton
                      color="error"
                      onClick={() => handleEliminar(producto.id)}
                    >
                      Eliminar
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {modo === 'crear' ? 'Agregar Producto' : 'Editar Producto'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={productoEditando.nombre || ''}
              onChange={(e) => setProductoEditando({ ...productoEditando, nombre: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              value={productoEditando.descripcion || ''}
              onChange={(e) => setProductoEditando({ ...productoEditando, descripcion: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Precio"
              type="number"
              value={productoEditando.precio || ''}
              onChange={(e) => setProductoEditando({ ...productoEditando, precio: parseFloat(e.target.value) })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="URL de la imagen"
              value={productoEditando.imagen_url || ''}
              onChange={(e) => setProductoEditando({ ...productoEditando, imagen_url: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={productoEditando.categoria || ''}
                onChange={(e) => setProductoEditando({ ...productoEditando, categoria: e.target.value })}
                label="Categoría"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.valor} value={cat.valor}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={productoEditando.disponible ?? true}
                  onChange={(e) => setProductoEditando({ ...productoEditando, disponible: e.target.checked })}
                />
              }
              label="Disponible"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleGuardar} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tabActiva} index={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCategoriaDialog(true)}
          sx={{ mb: 3 }}
        >
          Agregar Categoría
        </Button>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.nombre}</TableCell>
                  <TableCell>{categoria.valor}</TableCell>
                  <TableCell>
                    <ActionButton
                      color="error"
                      onClick={() => handleEliminarCategoria(categoria.id)}
                    >
                      Eliminar
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openCategoriaDialog} onClose={() => setOpenCategoriaDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Agregar Categoría</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={nuevaCategoria.nombre}
              onChange={(e) => {
                const nombre = e.target.value;
                const valor = nombre.toLowerCase()
                  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
                  .replace(/[^a-z0-9\s]/g, "") // Solo letras, números y espacios
                  .trim()
                  .replace(/\s+/g, '_'); // Espacios a guiones bajos
                setNuevaCategoria({ nombre, valor });
              }}
              margin="normal"
              required
              helperText="El nombre que verán los clientes en el menú"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoriaDialog(false)}>Cancelar</Button>
            <Button onClick={handleGuardarCategoria} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </AdminContainer>
  );
};

export default Admin; 