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
  MenuItem,
  Card,
  CardContent,
  InputAdornment,
  Grid,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { pagoAplicacionesService, pagosService, cuotasService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const conceptosAplicacion = ['Capital', 'Interés', 'Mora', 'Otros'];

const validationSchema = Yup.object({
  id_pago: Yup.number().required('El pago es requerido'),
  id_cuota: Yup.number().required('La cuota es requerida'),
  aplicado_a: Yup.string().required('El concepto es requerido'),
  monto_aplicado: Yup.number().required('El monto es requerido').min(0),
});

function PagoAplicaciones() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [aplicaciones, setAplicaciones] = useState([]);
  const [filteredAplicaciones, setFilteredAplicaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAplicacion, setSelectedAplicacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAplicacion, setDetailAplicacion] = useState(null);

  useEffect(() => {
    loadAplicaciones();
    loadPagos();
    loadCuotas();
  }, []);

  useEffect(() => {
    const filtered = aplicaciones.filter((app) =>
      app.aplicado_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id_pago.toString().includes(searchTerm) ||
      app.id_cuota.toString().includes(searchTerm)
    );
    setFilteredAplicaciones(filtered);
    setPage(0);
  }, [searchTerm, aplicaciones]);

  const loadAplicaciones = async () => {
    try {
      const data = await pagoAplicacionesService.getAll();
      setAplicaciones(data);
      setFilteredAplicaciones(data);
    } catch (error) {
      showSnackbar('Error al cargar aplicaciones', 'error');
    }
  };

  const loadPagos = async () => {
    try {
      const data = await pagosService.getAll();
      setPagos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCuotas = async () => {
    try {
      const data = await cuotasService.getAll();
      setCuotas(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDialog = (aplicacion = null) => {
    setSelectedAplicacion(aplicacion);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAplicacion(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedAplicacion) {
        await pagoAplicacionesService.update(selectedAplicacion.id_pago, values);
        showSnackbar('Aplicación actualizada exitosamente', 'success');
      } else {
        await pagoAplicacionesService.create(values);
        showSnackbar('Aplicación creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadAplicaciones();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar aplicación', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idPago) => {
    if (window.confirm('¿Está seguro de eliminar esta aplicación?')) {
      try {
        await pagoAplicacionesService.delete(idPago);
        showSnackbar('Aplicación eliminada exitosamente', 'success');
        loadAplicaciones();
      } catch (error) {
        showSnackbar('Error al eliminar aplicación', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Aplicación de Pagos
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nueva Aplicación
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar aplicaciones..."
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
          {filteredAplicaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => {
            const pago = pagos.find((p) => p.id_pago === app.id_pago);
            const cuota = cuotas.find((c) => c.id_cuota === app.id_cuota);
            return (
              <Card key={`${app.id_pago}-${app.id_cuota}-${app.aplicado_a}`} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {pago ? `Pago #${pago.id_pago}` : `Pago #${app.id_pago}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {cuota ? `Cuota #${cuota.numero_cuota}` : `Cuota #${app.id_cuota}`}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PaymentIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatCurrency(app.monto_aplicado)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={app.aplicado_a} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Aplicado" 
                        size="small" 
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => { setDetailAplicacion(app); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(app)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(app.id_pago)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
          <TablePagination
            component="div"
            count={filteredAplicaciones.length}
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
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pago</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cuota</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Aplicado A</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto Aplicado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAplicaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => {
                const pago = pagos.find((p) => p.id_pago === app.id_pago);
                const cuota = cuotas.find((c) => c.id_cuota === app.id_cuota);
                return (
                  <TableRow key={`${app.id_pago}-${app.id_cuota}-${app.aplicado_a}`} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {pago ? `Pago #${pago.id_pago}` : app.id_pago}
                      </Typography>
                    </TableCell>
                    <TableCell>{cuota ? `Cuota #${cuota.numero_cuota}` : app.id_cuota}</TableCell>
                    <TableCell>{app.aplicado_a}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(app.monto_aplicado)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => { setDetailAplicacion(app); setDetailOpen(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(app)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(app.id_pago)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredAplicaciones.length}
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailAplicacion(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Aplicación</DialogTitle>
        <DialogContent dividers>
          {detailAplicacion ? (
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Pago</Typography>
                <Typography variant="body2">Pago #{detailAplicacion.id_pago}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Cuota</Typography>
                <Typography variant="body2">Cuota #{detailAplicacion.id_cuota}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Aplicado A</Typography>
                <Typography variant="body2">{detailAplicacion.aplicado_a}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Monto Aplicado</Typography>
                <Typography variant="body2">{formatCurrency(detailAplicacion.monto_aplicado)}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailAplicacion(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedAplicacion ? 'Editar Aplicación' : 'Nueva Aplicación'}</DialogTitle>
        <Formik
          initialValues={{
            id_pago: selectedAplicacion?.id_pago || '',
            id_cuota: selectedAplicacion?.id_cuota || '',
            aplicado_a: selectedAplicacion?.aplicado_a || '',
            monto_aplicado: selectedAplicacion?.monto_aplicado || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={pagos}
                    getOptionLabel={(option) => `Pago #${option.id_pago} - ${formatCurrency(option.monto)}`}
                    value={pagos.find((p) => p.id_pago === values.id_pago) || null}
                    onChange={(e, newValue) => setFieldValue('id_pago', newValue ? newValue.id_pago : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pago"
                        required
                        error={touched.id_pago && Boolean(errors.id_pago)}
                        helperText={touched.id_pago && errors.id_pago}
                      />
                    )}
                  />

                  <Autocomplete
                    options={cuotas}
                    getOptionLabel={(option) => `Cuota #${option.id_cuota} - ${option.numero_cuota}`}
                    value={cuotas.find((c) => c.id_cuota === values.id_cuota) || null}
                    onChange={(e, newValue) => setFieldValue('id_cuota', newValue ? newValue.id_cuota : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuota"
                        required
                        error={touched.id_cuota && Boolean(errors.id_cuota)}
                        helperText={touched.id_cuota && errors.id_cuota}
                      />
                    )}
                  />

                  <Field name="aplicado_a">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Aplicado A"
                        select
                        fullWidth
                        required
                        error={touched.aplicado_a && Boolean(errors.aplicado_a)}
                        helperText={touched.aplicado_a && errors.aplicado_a}
                      >
                        {conceptosAplicacion.map((concepto) => (
                          <MenuItem key={concepto} value={concepto}>
                            {concepto}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Field>

                  <Field name="monto_aplicado">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Monto Aplicado (Q)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        error={touched.monto_aplicado && Boolean(errors.monto_aplicado)}
                        helperText={touched.monto_aplicado && errors.monto_aplicado}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedAplicacion ? 'Actualizar' : 'Crear'}
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

export default PagoAplicaciones;
