import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  Grid,
  Autocomplete,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Phone,
  Email,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ResponsiveButton from '../components/ResponsiveButton';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { clientesService, carterasService } from '../services/api';

const validationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'Mínimo 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es requerido')
    .min(2, 'Mínimo 2 caracteres'),
  dpi: Yup.string()
    .nullable()
    .matches(/^[0-9]{13}$/, 'DPI debe tener 13 dígitos'),
  nit: Yup.string()
    .nullable()
    .min(8, 'NIT inválido'),
  telefono: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^[0-9]{8}$/, 'Teléfono debe tener 8 dígitos'),
  correo: Yup.string()
    .email('Correo inválido')
    .nullable(),
  direccion: Yup.string()
    .required('La dirección es requerida'),
});

const Clientes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [clientes, setClientes] = useState([]);
  const [carteras, setCarteras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedCartera, setSelectedCartera] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCliente, setDetailCliente] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, cliente: null });

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailCliente(null);
  };

  const formik = useFormik({
    initialValues: {
      id_cartera: '',
      nombre: '',
      apellido: '',
      dpi: '',
      nit: '',
      telefono: '',
      correo: '',
      direccion: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (!editMode || !selectedCliente) {
          // create must be done via the dedicated page
          enqueueSnackbar('Para crear un cliente usa la página de creación.', { variant: 'warning' });
          setSubmitting(false);
          return;
        }
        await clientesService.update(selectedCliente.id_cliente, values);
        enqueueSnackbar('Cliente actualizado exitosamente', { variant: 'success' });
        handleClose();
        resetForm();
        fetchClientes();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.error || 'Error al guardar cliente',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      const [clientesData, carterasData] = await Promise.all([
        clientesService.getAll(),
        carterasService.getAll(),
      ]);
      setClientes(clientesData);
      setCarteras(carterasData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar clientes', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchClientes();
  }, []);

  // handleOpen removed since we use a separate route for creating clientes

  const handleEdit = (cliente) => {
    setEditMode(true);
    setSelectedCliente(cliente);
    
    // Buscar la cartera correspondiente
    const cartera = carteras.find(c => c.id_cartera === cliente.id_cartera);
    setSelectedCartera(cartera || null);
    
    formik.setValues({
      id_cartera: cliente.id_cartera || '',
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      dpi: cliente.dpi || '',
      nit: cliente.nit || '',
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCliente(null);
    setSelectedCartera(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    try {
      await clientesService.delete(id);
      enqueueSnackbar('Cliente eliminado exitosamente', { variant: 'success' });
      setDeleteConfirm({ open: false, cliente: null });
      fetchClientes();
    } catch (error) {
      enqueueSnackbar('Error al eliminar cliente', { variant: 'error' });
    }
  };

  const handleDeleteClick = (cliente) => {
    setDeleteConfirm({ open: true, cliente });
  };

  const getCarteraNombre = (idCartera) => {
    if (!idCartera) return 'Sin cartera';
    const cartera = carteras.find(c => c.id_cartera === idCartera);
    return cartera ? cartera.nombre : 'N/A';
  };

  const filteredClientes = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.apellido} ${cliente.dpi || ''} ${cliente.nit || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Gestión de Clientes"
        subtitle={`${filteredClientes.length} cliente${filteredClientes.length !== 1 ? 's' : ''} encontrado${filteredClientes.length !== 1 ? 's' : ''}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar lista">
              <IconButton onClick={fetchClientes} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <ResponsiveButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/app/clientes/nuevo')}
            >
              Nuevo Cliente
            </ResponsiveButton>
          </Box>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            placeholder="Buscar por nombre, apellido o identificación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: {
                '& input': {
                  fontSize: { xs: '16px', sm: 'inherit' },
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Vista móvil: Cards */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent sx={{ p: 2 }}>
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="40%" height={18} sx={{ mt: 1 }} />
                  <Skeleton width="80%" height={18} />
                </CardContent>
              </Card>
            ))
          ) : filteredClientes.length === 0 ? (
            <EmptyState
              title="No se encontraron clientes"
              description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer cliente para comenzar'}
              actionLabel="Nuevo Cliente"
              onAction={() => navigate('/app/clientes/nuevo')}
            />
          ) : (
            filteredClientes.map((cliente) => (
              <Card key={cliente.id_cliente} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {cliente.nombre} {cliente.apellido}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {cliente.id_cliente} | DPI: {cliente.dpi || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Phone fontSize="small" sx={{ fontSize: 14 }} color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {cliente.telefono}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={getCarteraNombre(cliente.id_cartera)} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={cliente.estado === 'A' ? 'Activo' : 'Inactivo'} 
                          size="small" 
                          color={cliente.estado === 'A' ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => { setDetailCliente(cliente); setDetailOpen(true); }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="info" onClick={() => handleEdit(cliente)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(cliente)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Vista desktop: Tabla */
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>DPI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>NIT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Contacto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cartera</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron clientes</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id_cliente} hover>
                    <TableCell>{cliente.id_cliente}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cliente.nombre} {cliente.apellido}
                      </Typography>
                    </TableCell>
                    <TableCell>{cliente.dpi || '-'}</TableCell>
                    <TableCell>{cliente.nit || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="caption">{cliente.telefono}</Typography>
                        {cliente.correo && (
                          <>
                            <Email fontSize="small" color="action" sx={{ ml: 1 }} />
                            <Typography variant="caption">{cliente.correo}</Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getCarteraNombre(cliente.id_cartera)} color="primary" size="small" variant="filled" />
                    </TableCell>
                    <TableCell>
                      <Chip label={cliente.estado === 'A' ? 'Activo' : 'Inactivo'} color={cliente.estado === 'A' ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => { setDetailCliente(cliente); setDetailOpen(true); }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton color="info" size="small" onClick={() => handleEdit(cliente)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" size="small" onClick={() => handleDeleteClick(cliente)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Detalles del Cliente</DialogTitle>
        <DialogContent dividers>
          {detailCliente ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Nombre Completo</Typography>
                <Typography variant="body1" fontWeight={500}>{detailCliente.nombre} {detailCliente.apellido}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">DPI</Typography>
                <Typography variant="body2">{detailCliente.dpi || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">NIT</Typography>
                <Typography variant="body2">{detailCliente.nit || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Teléfono</Typography>
                <Typography variant="body2">{detailCliente.telefono || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Correo</Typography>
                <Typography variant="body2">{detailCliente.correo || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Dirección</Typography>
                <Typography variant="body2">{detailCliente.direccion || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Cartera</Typography>
                <Chip label={getCarteraNombre(detailCliente.id_cartera)} size="small" color="primary" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Estado</Typography>
                <Chip 
                  label={detailCliente.estado === 'A' ? 'Activo' : 'Inactivo'} 
                  size="small" 
                  color={detailCliente.estado === 'A' ? 'success' : 'default'}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Cliente</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="nombre"
                  name="nombre"
                  label="Nombre *"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="apellido"
                  name="apellido"
                  label="Apellido *"
                  value={formik.values.apellido}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                  helperText={formik.touched.apellido && formik.errors.apellido}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="dpi"
                  name="dpi"
                  label="DPI (13 dígitos)"
                  placeholder="1234567890123"
                  value={formik.values.dpi}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.dpi && Boolean(formik.errors.dpi)}
                  helperText={formik.touched.dpi && formik.errors.dpi}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="nit"
                  name="nit"
                  label="NIT"
                  placeholder="1234567-8"
                  value={formik.values.nit}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nit && Boolean(formik.errors.nit)}
                  helperText={formik.touched.nit && formik.errors.nit}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="telefono"
                  name="telefono"
                  label="Teléfono * (8 dígitos)"
                  placeholder="12345678"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                  helperText={formik.touched.telefono && formik.errors.telefono}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="correo"
                  name="correo"
                  label="Correo Electrónico"
                  type="email"
                  value={formik.values.correo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.correo && Boolean(formik.errors.correo)}
                  helperText={formik.touched.correo && formik.errors.correo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="direccion"
                  name="direccion"
                  label="Dirección *"
                  multiline
                  rows={2}
                  value={formik.values.direccion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.direccion && Boolean(formik.errors.direccion)}
                  helperText={formik.touched.direccion && formik.errors.direccion}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={carteras}
                  getOptionLabel={(option) => option.nombre ? `${option.nombre} - ${option.descripcion || ''}` : ''}
                  value={selectedCartera}
                  onChange={(event, newValue) => {
                    setSelectedCartera(newValue);
                    formik.setFieldValue('id_cartera', newValue ? newValue.id_cartera : '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="dense"
                      label="Cartera"
                      placeholder="Selecciona una cartera..."
                      helperText="Opcional: Cartera asignada al cliente"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
            <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Guardando...' : 'Actualizar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, cliente: null })}
        onConfirm={() => deleteConfirm.cliente && handleDelete(deleteConfirm.cliente.id_cliente)}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${deleteConfirm.cliente?.nombre} ${deleteConfirm.cliente?.apellido}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </Box>
  );
};

export default Clientes;
