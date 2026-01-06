import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  Snackbar,
  Autocomplete,
  Chip,
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ResponsiveButton from '../components/ResponsiveButton';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { verificacionesPrestamoService, clientesService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const estadosVerificacion = ['Pendiente', 'En Proceso', 'Aprobado', 'Rechazado'];

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  fecha_solicitud: Yup.date().required('La fecha es requerida'),
  monto_solicitado: Yup.number().required('El monto es requerido').min(0),
  estado: Yup.string().required('El estado es requerido'),
  analista: Yup.string().required('El analista es requerido').max(100),
  comentarios: Yup.string().nullable(),
});

function VerificacionesPrestamo() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [verificaciones, setVerificaciones] = useState([]);
  const [filteredVerificaciones, setFilteredVerificaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVerificacion, setSelectedVerificacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailVerificacion, setDetailVerificacion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVerificaciones();
    loadClientes();
  }, []);

  useEffect(() => {
    const safeToSearch = (value) => {
      if (!value && value !== 0) return '';
      // if object, try to build a readable string
      if (typeof value === 'object') {
        if (value.nombre || value.apellido) return `${value.nombre || ''} ${value.apellido || ''}`.trim();
        try {
          return JSON.stringify(value);
        } catch (e) {
          return String(value);
        }
      }
      return String(value);
    };

    const filtered = verificaciones.filter((ver) => {
      const cliente = clientes.find((c) => c.id_cliente === ver.id_cliente);
      const analistaStr = safeToSearch(ver.analista).toLowerCase();
      const estadoStr = safeToSearch(ver.estado).toLowerCase();
      const nombreCliente = safeToSearch(cliente?.nombre).toLowerCase();
      const apellidoCliente = safeToSearch(cliente?.apellido).toLowerCase();
      const term = searchTerm.toLowerCase();

      return (
        analistaStr.includes(term) ||
        estadoStr.includes(term) ||
        nombreCliente.includes(term) ||
        apellidoCliente.includes(term)
      );
    });
    setFilteredVerificaciones(filtered);
    setPage(0);
  }, [searchTerm, verificaciones, clientes]);

  const loadVerificaciones = async () => {
    try {
      const data = await verificacionesPrestamoService.getAll();
      setVerificaciones(data);
      setFilteredVerificaciones(data);
    } catch (error) {
      showSnackbar('Error al cargar verificaciones', 'error');
    }
  };

  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado':
        return 'success';
      case 'Rechazado':
        return 'error';
      case 'En Proceso':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = (verificacion = null) => {
    if (verificacion) {
      setSelectedVerificacion(verificacion);
      setOpenDialog(true);
    } else {
      navigate('/app/verificaciones-prestamo/nuevo');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVerificacion(null);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailVerificacion(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedVerificacion) {
        await verificacionesPrestamoService.update(selectedVerificacion.id_verificacion, values);
        showSnackbar('Verificación actualizada exitosamente', 'success');
      } else {
        await verificacionesPrestamoService.create(values);
        showSnackbar('Verificación creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadVerificaciones();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar verificación', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta verificación?')) {
      try {
        await verificacionesPrestamoService.delete(id);
        showSnackbar('Verificación eliminada exitosamente', 'success');
        loadVerificaciones();
      } catch (error) {
        showSnackbar('Error al eliminar verificación', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Verificaciones de Préstamo
        </Typography>
        <ResponsiveButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/verificaciones-prestamo/nuevo')}>
          Nueva Verificación
        </ResponsiveButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Buscar verificaciones..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {isMobile ? (
        // Vista de tarjetas para móvil
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredVerificaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ver) => (
            <Card key={ver.id_verificacion} elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {getClienteNombre(ver.id_cliente)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ID: {ver.id_verificacion} | {new Date(ver.fecha_solicitud).toLocaleDateString('es-GT')}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {ver.analista}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={formatCurrency(ver.monto_solicitado)} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={ver.estado} 
                      size="small" 
                      color={getEstadoColor(ver.estado)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => { setDetailVerificacion(ver); setDetailOpen(true); }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(ver)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(ver.id_verificacion)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
          <TablePagination
            component="div"
            count={filteredVerificaciones.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas:"
          />
        </Box>
      ) : (
        // Vista de tabla para escritorio
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Solicitud</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto Solicitado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Analista</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVerificaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ver) => (
                <TableRow key={ver.id_verificacion} hover>
                  <TableCell>
                    <Typography variant="body2">{ver.id_verificacion}</Typography>
                  </TableCell>
                  <TableCell>{getClienteNombre(ver.id_cliente)}</TableCell>
                  <TableCell>{new Date(ver.fecha_solicitud).toLocaleDateString('es-GT')}</TableCell>
                  <TableCell>{formatCurrency(ver.monto_solicitado)}</TableCell>
                  <TableCell>
                    <Chip label={ver.estado} color={getEstadoColor(ver.estado)} size="small" />
                  </TableCell>
                  <TableCell>{ver.analista}</TableCell>
                  <TableCell align="center">
                    <IconButton color="info" size="small" onClick={() => { setDetailVerificacion(ver); setDetailOpen(true); }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenDialog(ver)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(ver.id_verificacion)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredVerificaciones.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Filas por página:"
          />
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Verificación</DialogTitle>
        <DialogContent dividers>
          {detailVerificacion ? (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="subtitle2">Cliente</Typography>
              <Typography variant="body2">{getClienteNombre(detailVerificacion.id_cliente)}</Typography>
              <Typography variant="subtitle2">Fecha Solicitud</Typography>
              <Typography variant="body2">{detailVerificacion.fecha_solicitud ? new Date(detailVerificacion.fecha_solicitud).toLocaleDateString('es-GT') : '-'}</Typography>
              <Typography variant="subtitle2">Monto Solicitado</Typography>
              <Typography variant="body2">{formatCurrency(detailVerificacion.monto_solicitado)}</Typography>
              <Typography variant="subtitle2">Estado</Typography>
              <Typography variant="body2">{detailVerificacion.estado}</Typography>
              <Typography variant="subtitle2">Analista</Typography>
              <Typography variant="body2">{detailVerificacion.analista}</Typography>
            </Box>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedVerificacion ? 'Editar Verificación' : 'Nueva Verificación'}</DialogTitle>
        <Formik
          initialValues={{
            id_cliente: selectedVerificacion?.id_cliente || '',
            fecha_solicitud: selectedVerificacion?.fecha_solicitud?.split('T')[0] || '',
            monto_solicitado: selectedVerificacion?.monto_solicitado || '',
            estado: selectedVerificacion?.estado || 'Pendiente',
            analista: selectedVerificacion?.analista || '',
            comentarios: selectedVerificacion?.comentarios || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido} - DPI: ${option.dpi}`}
                    value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                    onChange={(e, newValue) => setFieldValue('id_cliente', newValue ? newValue.id_cliente : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        required
                        error={touched.id_cliente && Boolean(errors.id_cliente)}
                        helperText={touched.id_cliente && errors.id_cliente}
                      />
                    )}
                  />

                  <Field name="fecha_solicitud">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Fecha de Solicitud"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={touched.fecha_solicitud && Boolean(errors.fecha_solicitud)}
                        helperText={touched.fecha_solicitud && errors.fecha_solicitud}
                      />
                    )}
                  </Field>

                  <Field name="monto_solicitado">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Monto Solicitado (Q)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        error={touched.monto_solicitado && Boolean(errors.monto_solicitado)}
                        helperText={touched.monto_solicitado && errors.monto_solicitado}
                      />
                    )}
                  </Field>

                  <Field name="estado">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Estado"
                        select
                        fullWidth
                        required
                        error={touched.estado && Boolean(errors.estado)}
                        helperText={touched.estado && errors.estado}
                      >
                        {estadosVerificacion.map((estado) => (
                          <MenuItem key={estado} value={estado}>
                            {estado}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Field>

                  <Field name="analista">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Analista"
                        fullWidth
                        required
                        error={touched.analista && Boolean(errors.analista)}
                        helperText={touched.analista && errors.analista}
                      />
                    )}
                  </Field>

                  <Field name="comentarios">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Comentarios"
                        fullWidth
                        multiline
                        rows={3}
                        error={touched.comentarios && Boolean(errors.comentarios)}
                        helperText={touched.comentarios && errors.comentarios}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedVerificacion ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VerificacionesPrestamo;
