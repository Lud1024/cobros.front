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
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { visitasCobroService, clientesService, prestamosService } from '../services/api';
import ResponsiveButton from '../components/ResponsiveButton';
import { formatCurrency } from '../utils/formatters';

const resultadosVisita = ['Pago Realizado', 'Promesa de Pago', 'No Localizado', 'Rechazó Pago', 'Refinanciación'];

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  id_prestamo: Yup.number().required('El préstamo es requerido'),
  resultado: Yup.string().required('El resultado es requerido'),
  mensaje_dejado: Yup.string().nullable(),
  total_cobros_info: Yup.string().nullable(),
});

function VisitasCobro() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [visitas, setVisitas] = useState([]);
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVisita, setSelectedVisita] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailVisita, setDetailVisita] = useState(null);

  useEffect(() => {
    loadVisitas();
    loadClientes();
    loadPrestamos();
  }, []);

  useEffect(() => {
    const safeToSearch = (v) => (v ? String(v).toLowerCase() : '');
    const term = searchTerm.toLowerCase();
    const filtered = visitas.filter((vis) => {
      const cliente = clientes.find((c) => c.id_cliente === vis.id_cliente);
      return (
        safeToSearch(vis.resultado).includes(term) ||
        safeToSearch(cliente?.nombre).includes(term) ||
        safeToSearch(cliente?.apellido).includes(term)
      );
    });
    setFilteredVisitas(filtered);
    setPage(0);
  }, [searchTerm, visitas, clientes]);

  const loadVisitas = async () => {
    try {
      const data = await visitasCobroService.getAll();
      setVisitas(data);
      setFilteredVisitas(data);
    } catch (error) {
      showSnackbar('Error al cargar visitas', 'error');
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

  const loadPrestamos = async () => {
    try {
      const data = await prestamosService.getAll();
      setPrestamos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
  };

  const handleOpenDialog = (visita = null) => {
    setSelectedVisita(visita);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVisita(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedVisita) {
        await visitasCobroService.update(selectedVisita.id_visita, values);
        showSnackbar('Visita actualizada exitosamente', 'success');
      } else {
        await visitasCobroService.create(values);
        showSnackbar('Visita creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadVisitas();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar visita', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta visita?')) {
      try {
        await visitasCobroService.delete(id);
        showSnackbar('Visita eliminada exitosamente', 'success');
        loadVisitas();
      } catch (error) {
        showSnackbar('Error al eliminar visita', 'error');
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
          Visitas de Cobro
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nueva Visita
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar visitas..."
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
          {filteredVisitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vis) => {
            const prestamo = prestamos.find((p) => p.id_prestamo === vis.id_prestamo);
            return (
              <Card key={vis.id_visita} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {getClienteNombre(vis.id_cliente)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {vis.id_visita} | {vis.fecha_visita ? new Date(vis.fecha_visita).toLocaleDateString('es-GT') : '-'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {prestamo ? `Préstamo #${prestamo.id_prestamo}` : `Préstamo #${vis.id_prestamo}`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={vis.resultado} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Visita" 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => { setDetailVisita(vis); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(vis)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(vis.id_visita)}
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
            count={filteredVisitas.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Préstamo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Resultado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vis) => {
                const prestamo = prestamos.find((p) => p.id_prestamo === vis.id_prestamo);
                return (
                  <TableRow key={vis.id_visita} hover>
                    <TableCell>
                      <Typography variant="body2">{vis.id_visita}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {getClienteNombre(vis.id_cliente)}
                      </Typography>
                    </TableCell>
                    <TableCell>{prestamo ? `Préstamo #${prestamo.id_prestamo} - ${formatCurrency(prestamo.monto)}` : vis.id_prestamo}</TableCell>
                    <TableCell>{vis.resultado}</TableCell>
                    <TableCell>
                      {vis.fecha_visita ? new Date(vis.fecha_visita).toLocaleDateString('es-GT') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => { setDetailVisita(vis); setDetailOpen(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(vis)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(vis.id_visita)}>
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
            count={filteredVisitas.length}
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailVisita(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Visita</DialogTitle>
        <DialogContent dividers>
          {detailVisita ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Cliente</Typography>
                <Typography variant="body2">{getClienteNombre(detailVisita.id_cliente)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Préstamo</Typography>
                <Typography variant="body2">#{detailVisita.id_prestamo}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha</Typography>
                <Typography variant="body2">{detailVisita.fecha_visita ? new Date(detailVisita.fecha_visita).toLocaleDateString('es-GT') : '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Resultado</Typography>
                <Typography variant="body2">{detailVisita.resultado}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Mensaje Dejado</Typography>
                <Typography variant="body2">{detailVisita.mensaje_dejado || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Info Total Cobros</Typography>
                <Typography variant="body2">{detailVisita.total_cobros_info || '-'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailVisita(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedVisita ? 'Editar Visita' : 'Nueva Visita'}</DialogTitle>
        <Formik
          initialValues={{
            id_cliente: selectedVisita?.id_cliente || '',
            id_prestamo: selectedVisita?.id_prestamo || '',
            resultado: selectedVisita?.resultado || '',
            mensaje_dejado: selectedVisita?.mensaje_dejado || '',
            total_cobros_info: selectedVisita?.total_cobros_info || '',
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

                  <Autocomplete
                    options={prestamos}
                    getOptionLabel={(option) => `Préstamo #${option.id_prestamo}`}
                    value={prestamos.find((p) => p.id_prestamo === values.id_prestamo) || null}
                    onChange={(e, newValue) => setFieldValue('id_prestamo', newValue ? newValue.id_prestamo : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Préstamo"
                        required
                        error={touched.id_prestamo && Boolean(errors.id_prestamo)}
                        helperText={touched.id_prestamo && errors.id_prestamo}
                      />
                    )}
                  />

                  <Field name="resultado">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Resultado"
                        select
                        fullWidth
                        required
                        error={touched.resultado && Boolean(errors.resultado)}
                        helperText={touched.resultado && errors.resultado}
                      >
                        {resultadosVisita.map((resultado) => (
                          <MenuItem key={resultado} value={resultado}>
                            {resultado}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Field>

                  <Field name="mensaje_dejado">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Mensaje Dejado"
                        fullWidth
                        multiline
                        rows={3}
                        error={touched.mensaje_dejado && Boolean(errors.mensaje_dejado)}
                        helperText={touched.mensaje_dejado && errors.mensaje_dejado}
                      />
                    )}
                  </Field>

                  <Field name="total_cobros_info">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Información Total de Cobros"
                        fullWidth
                        multiline
                        rows={2}
                        error={touched.total_cobros_info && Boolean(errors.total_cobros_info)}
                        helperText={touched.total_cobros_info && errors.total_cobros_info}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedVisita ? 'Actualizar' : 'Crear'}
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

export default VisitasCobro;
