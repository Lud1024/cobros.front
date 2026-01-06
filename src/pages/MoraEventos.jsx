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
  EventBusy as EventBusyIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { moraEventosService, cuotasService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const validationSchema = Yup.object({
  id_cuota: Yup.number().required('La cuota es requerida'),
  fecha_calculo: Yup.date().required('La fecha es requerida'),
  dias_atraso: Yup.number().required('Los días son requeridos').min(0),
  interes_mora: Yup.number().required('El interés es requerido').min(0),
});

function MoraEventos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [moraEventos, setMoraEventos] = useState([]);
  const [filteredEventos, setFilteredEventos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEvento, setDetailEvento] = useState(null);

  useEffect(() => {
    loadMoraEventos();
    loadCuotas();
  }, []);

  useEffect(() => {
    const filtered = moraEventos.filter((evento) =>
      evento.dias_atraso.toString().includes(searchTerm) ||
      evento.id_cuota.toString().includes(searchTerm)
    );
    setFilteredEventos(filtered);
    setPage(0);
  }, [searchTerm, moraEventos]);

  const loadMoraEventos = async () => {
    try {
      const data = await moraEventosService.getAll();
      setMoraEventos(data);
      setFilteredEventos(data);
    } catch (error) {
      showSnackbar('Error al cargar eventos de mora', 'error');
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

  const handleOpenDialog = (evento = null) => {
    setSelectedEvento(evento);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvento(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedEvento) {
        await moraEventosService.update(selectedEvento.id_mora, values);
        showSnackbar('Evento actualizado exitosamente', 'success');
      } else {
        await moraEventosService.create(values);
        showSnackbar('Evento creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadMoraEventos();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar evento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este evento de mora?')) {
      try {
        await moraEventosService.delete(id);
        showSnackbar('Evento eliminado exitosamente', 'success');
        loadMoraEventos();
      } catch (error) {
        showSnackbar('Error al eliminar evento', 'error');
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
          Eventos de Mora
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nuevo Evento
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar eventos..."
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
          {filteredEventos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((evento) => {
            const cuota = cuotas.find((c) => c.id_cuota === evento.id_cuota);
            return (
              <Card key={evento.id_mora} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {cuota ? `Cuota #${cuota.numero_cuota}` : `Cuota #${evento.id_cuota}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {evento.id_mora} | {new Date(evento.fecha_calculo).toLocaleDateString('es-GT')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <EventBusyIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {evento.dias_atraso} días de atraso
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={formatCurrency(evento.interes_mora)} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Mora" 
                        size="small" 
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => { setDetailEvento(evento); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(evento)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(evento.id_mora)}
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
            count={filteredEventos.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cuota</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Cálculo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Días Atraso</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Interés Mora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEventos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((evento) => {
                const cuota = cuotas.find((c) => c.id_cuota === evento.id_cuota);
                return (
                  <TableRow key={evento.id_mora} hover>
                    <TableCell>
                      <Typography variant="body2">{evento.id_mora}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cuota ? `Cuota #${cuota.numero_cuota}` : evento.id_cuota}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(evento.fecha_calculo).toLocaleDateString('es-GT')}</TableCell>
                    <TableCell>{evento.dias_atraso}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(evento.interes_mora)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => { setDetailEvento(evento); setDetailOpen(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(evento)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(evento.id_mora)}>
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
            count={filteredEventos.length}
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailEvento(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Evento de Mora</DialogTitle>
        <DialogContent dividers>
          {detailEvento ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Cuota</Typography>
                <Typography variant="body2">Cuota #{detailEvento.id_cuota}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha Cálculo</Typography>
                <Typography variant="body2">{new Date(detailEvento.fecha_calculo).toLocaleDateString('es-GT')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Días Atraso</Typography>
                <Typography variant="body2">{detailEvento.dias_atraso}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Interés Mora</Typography>
                <Typography variant="body2">{formatCurrency(detailEvento.interes_mora)}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailEvento(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvento ? 'Editar Evento de Mora' : 'Nuevo Evento de Mora'}</DialogTitle>
        <Formik
          initialValues={{
            id_cuota: selectedEvento?.id_cuota || '',
            fecha_calculo: selectedEvento?.fecha_calculo?.split('T')[0] || '',
            dias_atraso: selectedEvento?.dias_atraso || '',
            interes_mora: selectedEvento?.interes_mora || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

                  <Field name="fecha_calculo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Fecha de Cálculo"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={touched.fecha_calculo && Boolean(errors.fecha_calculo)}
                        helperText={touched.fecha_calculo && errors.fecha_calculo}
                      />
                    )}
                  </Field>

                  <Field name="dias_atraso">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Días de Atraso"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ min: '0' }}
                        error={touched.dias_atraso && Boolean(errors.dias_atraso)}
                        helperText={touched.dias_atraso && errors.dias_atraso}
                      />
                    )}
                  </Field>

                  <Field name="interes_mora">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Interés de Mora (Q)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        error={touched.interes_mora && Boolean(errors.interes_mora)}
                        helperText={touched.interes_mora && errors.interes_mora}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedEvento ? 'Actualizar' : 'Crear'}
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

export default MoraEventos;
