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
  Print as PrintIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { visitasCobroService, clientesService, prestamosService, cuotasService, politicasMoraService } from '../services/api';
import ResponsiveButton from '../components/ResponsiveButton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { createPrintWindow, closePrintWindow, printNoEncontradoTicket } from '../utils/printTickets';

// Valores según ENUM de la BD: 'COBRO','NO_ENCONTRADO','PROMESA','NEGOCIACION','OTRO'
const resultadosVisita = [
  { value: 'COBRO', label: 'Cobro Realizado' },
  { value: 'NO_ENCONTRADO', label: 'No Localizado' },
  { value: 'PROMESA', label: 'Promesa de Pago' },
  { value: 'NEGOCIACION', label: 'Negociación' },
  { value: 'OTRO', label: 'Otro' },
];

const getResultadoLabel = (value) => {
  const found = resultadosVisita.find(r => r.value === value);
  return found ? found.label : value;
};

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  id_prestamo: Yup.number().required('El préstamo es requerido'),
  resultado: Yup.string().required('El resultado es requerido'),
  mensaje_dejado: Yup.string().nullable(),
  total_cobros_info: Yup.number()
    .typeError('Debe ser un monto numerico')
    .min(0, 'No puede ser negativo')
    .nullable(),
});

function VisitasCobro() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [visitas, setVisitas] = useState([]);
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [politicasMora, setPoliticasMora] = useState([]);
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
    loadCuotas();
    loadPoliticasMora();
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

  const loadCuotas = async () => {
    try {
      const data = await cuotasService.getAll();
      setCuotas(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadPoliticasMora = async () => {
    try {
      const data = await politicasMoraService.getAll();
      setPoliticasMora(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
  };

  const getPoliticaVigente = (cliente) => {
    if (!cliente?.id_cartera) return null;
    const today = new Date().toISOString().slice(0, 10);
    return politicasMora
      .filter((politica) => {
        const vigenteDesde = politica.vigente_desde ? String(politica.vigente_desde).slice(0, 10) : '';
        const vigenteHasta = politica.vigente_hasta ? String(politica.vigente_hasta).slice(0, 10) : '';
        return String(politica.id_cartera) === String(cliente.id_cartera) &&
          (!vigenteDesde || vigenteDesde <= today) &&
          (!vigenteHasta || vigenteHasta >= today);
      })
      .sort((a, b) => String(b.vigente_desde || '').localeCompare(String(a.vigente_desde || '')))[0] || null;
  };

  const handlePrintNoEncontrado = (visita, printWindow = null) => {
    const prestamo = prestamos.find((p) => p.id_prestamo === visita.id_prestamo);
    const cliente = clientes.find((c) => c.id_cliente === visita.id_cliente);
    const printed = printNoEncontradoTicket({
      visita,
      prestamo,
      cliente,
      cuotas,
      politica: getPoliticaVigente(cliente),
    }, printWindow);

    if (!printed) {
      showSnackbar('No se pudo abrir la ventana de impresion', 'error');
    }
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
    let printWindow = null;
    try {
      const payload = {
        ...values,
        total_cobros_info: values.total_cobros_info === '' || values.total_cobros_info == null
          ? 0
          : Number(values.total_cobros_info)
      };
      const shouldPrintNoEncontrado = payload.resultado === 'NO_ENCONTRADO';

      if (shouldPrintNoEncontrado) {
        printWindow = createPrintWindow();
      }

      let result = null;
      if (selectedVisita) {
        result = await visitasCobroService.update(selectedVisita.id_visita, payload);
        showSnackbar('Visita actualizada exitosamente', 'success');
      } else {
        result = await visitasCobroService.create(payload);
        showSnackbar('Visita creada exitosamente', 'success');
      }

      if (shouldPrintNoEncontrado) {
        handlePrintNoEncontrado({
          ...selectedVisita,
          ...payload,
          id_visita: selectedVisita?.id_visita || result?.id,
          fecha_visita: selectedVisita?.fecha_visita || new Date().toISOString(),
        }, printWindow);
      }

      handleCloseDialog();
      loadVisitas();
      loadCuotas();
    } catch (error) {
      closePrintWindow(printWindow);
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
                      ID: {vis.id_visita} | {vis.fecha_visita ? formatDate(vis.fecha_visita) : '-'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {prestamo ? `Préstamo #${prestamo.id_prestamo}` : `Préstamo #${vis.id_prestamo}`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={getResultadoLabel(vis.resultado)} 
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
                    {vis.resultado === 'NO_ENCONTRADO' && (
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handlePrintNoEncontrado(vis)}
                        title="Imprimir aviso"
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    )}
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
                    <TableCell>{getResultadoLabel(vis.resultado)}</TableCell>
                    <TableCell>
                      {vis.fecha_visita ? formatDate(vis.fecha_visita) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {vis.resultado === 'NO_ENCONTRADO' && (
                        <IconButton color="warning" size="small" onClick={() => handlePrintNoEncontrado(vis)}>
                          <PrintIcon />
                        </IconButton>
                      )}
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
                <Typography variant="body2">{detailVisita.fecha_visita ? formatDate(detailVisita.fecha_visita) : '-'}</Typography>
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
                <Typography variant="subtitle2">Monto cobrado</Typography>
                <Typography variant="body2">{formatCurrency(detailVisita.total_cobros_info || 0)}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {detailVisita?.resultado === 'NO_ENCONTRADO' && (
            <Button startIcon={<PrintIcon />} onClick={() => handlePrintNoEncontrado(detailVisita)}>
              Imprimir aviso
            </Button>
          )}
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
                          <MenuItem key={resultado.value} value={resultado.value}>
                            {resultado.label}
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
                        label="Monto cobrado"
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, step: '0.01' }}
                        InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                        placeholder="0.00"
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
                  {isSubmitting ? 'Guardando...' : selectedVisita ? 'Actualizar' : 'Crear'}
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
