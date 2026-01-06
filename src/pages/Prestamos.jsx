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
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import ResponsiveButton from '../components/ResponsiveButton';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { prestamosService, clientesService, periodicidadesService } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';

const validationSchema = Yup.object({
  id_cliente: Yup.number()
    .required('El cliente es requerido'),
  monto_prestamo: Yup.number()
    .required('El monto es requerido')
    .positive('El monto debe ser positivo')
    .min(1, 'El monto debe ser mayor a 0'),
  tasa_interes: Yup.number()
    .required('La tasa de interés es requerida')
    .min(0, 'La tasa no puede ser negativa')
    .max(100, 'La tasa no puede ser mayor a 100%'),
  plazo_meses: Yup.number()
    .required('El plazo es requerido')
    .integer('Debe ser un número entero')
    .positive('El plazo debe ser positivo')
    .min(1, 'El plazo debe ser al menos 1 mes'),
  fecha_desembolso: Yup.date()
    .required('La fecha de desembolso es requerida'),
  id_periodicidad: Yup.number()
    .required('La periodicidad es requerida'),
});

const Prestamos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [periodicidades, setPeriodicidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPrestamo, setDetailPrestamo] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, prestamo: null });

  const formik = useFormik({
    initialValues: {
      id_cliente: '',
      monto_prestamo: '',
      tasa_interes: '',
      plazo_meses: '',
      fecha_desembolso: '',
      id_periodicidad: '',
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Mapear campos del frontend al backend
        const payload = {
          id_cliente: values.id_cliente,
          monto: values.monto_prestamo,
          tasa_interes_anual: values.tasa_interes,
          plazo_cuotas: values.plazo_meses,
          fecha_inicio: values.fecha_desembolso,
          id_periodicidad: values.id_periodicidad,
          dia_pago: 1, // Valor por defecto
          estado: 'activo'
        };

        if (editMode && selectedPrestamo) {
          await prestamosService.update(selectedPrestamo.id_prestamo, payload);
          enqueueSnackbar('Préstamo actualizado exitosamente', { variant: 'success' });
        } else {
          await prestamosService.create(payload);
          enqueueSnackbar('Préstamo creado exitosamente', { variant: 'success' });
        }
        handleClose();
        resetForm();
        fetchPrestamos();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.error || 'Error al guardar préstamo',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchPrestamos = useCallback(async () => {
    try {
      setLoading(true);
      const [prestamosData, clientesData, periodicidadesData] = await Promise.all([
        prestamosService.getAll(),
        clientesService.getAll(),
        periodicidadesService.getAll(),
      ]);
      setPrestamos(prestamosData);
      setClientes(clientesData);
      setPeriodicidades(periodicidadesData);
      console.log('Periodicidades cargadas:', periodicidadesData);
    } catch (error) {
      console.error('Error cargando préstamos:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar datos', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchPrestamos();
  }, []);

  // Create now handled in a dedicated route

  const handleEdit = (prestamo) => {
    setEditMode(true);
    setSelectedPrestamo(prestamo);
    formik.setValues({
      id_cliente: prestamo.id_cliente || '',
      monto_prestamo: prestamo.monto_prestamo || '',
      tasa_interes: prestamo.tasa_interes || '',
      plazo_meses: prestamo.plazo_meses || '',
      fecha_desembolso: prestamo.fecha_desembolso?.split('T')[0] || '',
      id_periodicidad: prestamo.id_periodicidad || '',
      observaciones: prestamo.observaciones || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedPrestamo(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    try {
      await prestamosService.delete(id);
      enqueueSnackbar('Préstamo eliminado exitosamente', { variant: 'success' });
      setDeleteConfirm({ open: false, prestamo: null });
      fetchPrestamos();
    } catch (error) {
      enqueueSnackbar('Error al eliminar préstamo', { variant: 'error' });
    }
  };

  const handleDeleteClick = (prestamo) => {
    setDeleteConfirm({ open: true, prestamo });
  };

  const getClienteName = (idCliente) => {
    const cliente = clientes.find((c) => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
  };

  const getPeriodicidadName = (idPeriodicidad) => {
    const periodicidad = periodicidades.find((p) => p.id_periodicidad === idPeriodicidad);
    return periodicidad?.nombre || 'N/A';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': 'warning',
      'Aprobado': 'success',
      'Rechazado': 'error',
      'Cancelado': 'default',
      'Pagado': 'info',
    };
    return colores[estado] || 'default';
  };

  const filteredPrestamos = prestamos.filter((prestamo) => {
    const clienteNombre = getClienteName(prestamo.id_cliente);
    return (
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestamo.id_prestamo?.toString().includes(searchTerm)
    );
  });



  return (
    <Box>
      <PageHeader
        title="Gestión de Préstamos"
        subtitle={`${filteredPrestamos.length} préstamo${filteredPrestamos.length !== 1 ? 's' : ''} encontrado${filteredPrestamos.length !== 1 ? 's' : ''}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar lista">
              <IconButton onClick={fetchPrestamos} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <ResponsiveButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/app/prestamos/nuevo')}
            >
              Nuevo Préstamo
            </ResponsiveButton>
          </Box>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            placeholder="Buscar por cliente o ID de préstamo..."
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
                  <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                  <Skeleton width="80%" height={18} />
                </CardContent>
              </Card>
            ))
          ) : filteredPrestamos.length === 0 ? (
            <EmptyState
              title="No se encontraron préstamos"
              description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer préstamo para comenzar'}
              actionLabel="Nuevo Préstamo"
              onAction={() => navigate('/app/prestamos/nuevo')}
            />
          ) : (
            filteredPrestamos.map((prestamo) => (
              <Card key={prestamo.id_prestamo} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {getClienteName(prestamo.id_cliente)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Préstamo #{prestamo.id_prestamo}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ mt: 0.5 }}>
                        {formatCurrency(prestamo.monto_prestamo)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${prestamo.tasa_interes}% - ${prestamo.plazo_meses} meses`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={prestamo.estado || 'Pendiente'}
                          size="small"
                          color={getEstadoColor(prestamo.estado)}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => { setDetailPrestamo(prestamo); setDetailOpen(true); }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="info" onClick={() => handleEdit(prestamo)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(prestamo)}>
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
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tasa %</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Plazo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Periodicidad</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Desembolso</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredPrestamos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron préstamos</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrestamos.map((prestamo) => (
                  <TableRow key={prestamo.id_prestamo} hover>
                    <TableCell>{prestamo.id_prestamo}</TableCell>
                    <TableCell>{getClienteName(prestamo.id_cliente)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(prestamo.monto_prestamo)}
                      </Typography>
                    </TableCell>
                    <TableCell>{prestamo.tasa_interes}%</TableCell>
                    <TableCell>{prestamo.plazo_meses} meses</TableCell>
                    <TableCell>{getPeriodicidadName(prestamo.id_periodicidad)}</TableCell>
                    <TableCell>
                      {prestamo.fecha_desembolso
                        ? format(new Date(prestamo.fecha_desembolso), 'dd/MM/yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={prestamo.estado || 'Pendiente'}
                        color={getEstadoColor(prestamo.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => { setDetailPrestamo(prestamo); setDetailOpen(true); }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleEdit(prestamo)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(prestamo)}
                        >
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailPrestamo(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Detalles del Préstamo</DialogTitle>
        <DialogContent dividers>
          {detailPrestamo ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Cliente</Typography>
                <Typography variant="body1" fontWeight={500}>{getClienteName(detailPrestamo.id_cliente)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Monto</Typography>
                <Typography variant="h6" color="primary.main">{formatCurrency(detailPrestamo.monto_prestamo)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Tasa</Typography>
                <Typography variant="body1">{detailPrestamo.tasa_interes}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Plazo</Typography>
                <Typography variant="body2">{detailPrestamo.plazo_meses} meses</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Periodicidad</Typography>
                <Typography variant="body2">{getPeriodicidadName(detailPrestamo.id_periodicidad)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Fecha de Desembolso</Typography>
                <Typography variant="body2">{detailPrestamo.fecha_desembolso ? format(new Date(detailPrestamo.fecha_desembolso), 'dd/MM/yyyy') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Estado</Typography>
                <Chip
                  label={detailPrestamo.estado || 'Pendiente'}
                  color={getEstadoColor(detailPrestamo.estado)}
                  size="small"
                />
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailPrestamo(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Préstamo' : 'Nuevo Préstamo'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={clientes}
                  getOptionLabel={(option) => `${option.nombre} ${option.apellido} - ${option.dpi || 'Sin DPI'}`}
                  value={clientes.find((c) => c.id_cliente === formik.values.id_cliente) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('id_cliente', newValue?.id_cliente || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="dense"
                      label="Cliente"
                      error={formik.touched.id_cliente && Boolean(formik.errors.id_cliente)}
                      helperText={formik.touched.id_cliente && formik.errors.id_cliente}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="monto_prestamo"
                  name="monto_prestamo"
                  label="Monto del Préstamo"
                  type="number"
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={formik.values.monto_prestamo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.monto_prestamo && Boolean(formik.errors.monto_prestamo)}
                  helperText={formik.touched.monto_prestamo && formik.errors.monto_prestamo}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="tasa_interes"
                  name="tasa_interes"
                  label="Tasa de Interés"
                  type="number"
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  value={formik.values.tasa_interes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.tasa_interes && Boolean(formik.errors.tasa_interes)}
                  helperText={formik.touched.tasa_interes && formik.errors.tasa_interes}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="plazo_meses"
                  name="plazo_meses"
                  label="Plazo (Meses)"
                  type="number"
                  value={formik.values.plazo_meses}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.plazo_meses && Boolean(formik.errors.plazo_meses)}
                  helperText={formik.touched.plazo_meses && formik.errors.plazo_meses}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="fecha_desembolso"
                  name="fecha_desembolso"
                  label="Fecha de Desembolso"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.fecha_desembolso}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fecha_desembolso && Boolean(formik.errors.fecha_desembolso)}
                  helperText={formik.touched.fecha_desembolso && formik.errors.fecha_desembolso}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  id="id_periodicidad"
                  name="id_periodicidad"
                  label="Periodicidad"
                  SelectProps={{ native: true }}
                  value={formik.values.id_periodicidad}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.id_periodicidad && Boolean(formik.errors.id_periodicidad)}
                  helperText={formik.touched.id_periodicidad && formik.errors.id_periodicidad}
                >
                  <option value="">Seleccionar...</option>
                  {periodicidades.map((p) => (
                    <option key={p.id_periodicidad} value={p.id_periodicidad}>
                      {p.codigo} ({p.dias} días)
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="observaciones"
                  name="observaciones"
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={formik.values.observaciones}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              {formik.isSubmitting ? 'Guardando...' : (editMode ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, prestamo: null })}
        onConfirm={() => deleteConfirm.prestamo && handleDelete(deleteConfirm.prestamo.id_prestamo)}
        title="Eliminar Préstamo"
        message={`¿Estás seguro de que deseas eliminar el préstamo #${deleteConfirm.prestamo?.id_prestamo} de ${deleteConfirm.prestamo ? getClienteName(deleteConfirm.prestamo.id_cliente) : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </Box>
  );
};

export default Prestamos;
