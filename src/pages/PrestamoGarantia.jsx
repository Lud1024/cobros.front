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
  AccountBalance as AccountBalanceIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ResponsiveButton from '../components/ResponsiveButton';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { prestamoGarantiaService, prestamosService, metodosGarantiaService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const validationSchema = Yup.object({
  id_prestamo: Yup.number().required('El préstamo es requerido'),
  id_metodo: Yup.number().required('El método de garantía es requerido'),
  valor_garantia: Yup.number().required('El valor es requerido').min(0),
});

function PrestamoGarantia() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [garantias, setGarantias] = useState([]);
  const [filteredGarantias, setFilteredGarantias] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGarantia, setSelectedGarantia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGarantia, setDetailGarantia] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGarantias();
    loadPrestamos();
    loadMetodos();
  }, []);

  useEffect(() => {
    const filtered = garantias.filter((gar) =>
      gar.id_prestamo.toString().includes(searchTerm) ||
      gar.valor_garantia.toString().includes(searchTerm)
    );
    setFilteredGarantias(filtered);
    setPage(0);
  }, [searchTerm, garantias]);

  const loadGarantias = async () => {
    try {
      const data = await prestamoGarantiaService.getAll();
      setGarantias(data);
      setFilteredGarantias(data);
    } catch (error) {
      showSnackbar('Error al cargar garantías', 'error');
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

  const loadMetodos = async () => {
    try {
      const data = await metodosGarantiaService.getAll();
      setMetodos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getMetodoNombre = (idMetodo) => {
    const metodo = metodos.find((m) => m.id_metodo === idMetodo);
    return metodo ? metodo.nombre_metodo : '-';
  };

  const handleOpenDialog = (garantia = null) => {
    if (garantia) {
      setSelectedGarantia(garantia);
      setOpenDialog(true);
    } else {
      navigate('/app/prestamo-garantia/nuevo');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGarantia(null);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailGarantia(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedGarantia) {
        await prestamoGarantiaService.update(selectedGarantia.id_prestamo, values);
        showSnackbar('Garantía actualizada exitosamente', 'success');
      } else {
        await prestamoGarantiaService.create(values);
        showSnackbar('Garantía creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadGarantias();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar garantía', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idPrestamo, idMetodo) => {
    if (window.confirm('¿Está seguro de eliminar esta garantía?')) {
      try {
        await prestamoGarantiaService.delete(idPrestamo);
        showSnackbar('Garantía eliminada exitosamente', 'success');
        loadGarantias();
      } catch (error) {
        showSnackbar('Error al eliminar garantía', 'error');
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
          Garantías de Préstamos
        </Typography>
        <ResponsiveButton variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/app/prestamo-garantia/nuevo')}>
          Nueva Garantía
        </ResponsiveButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Buscar garantías..."
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
          {filteredGarantias.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((gar) => {
            const prestamo = prestamos.find((p) => p.id_prestamo === gar.id_prestamo);
            return (
              <Card key={`${gar.id_prestamo}-${gar.id_metodo}`} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      Préstamo #{gar.id_prestamo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {prestamo ? formatCurrency(prestamo.monto) : '-'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccountBalanceIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatCurrency(gar.valor_garantia)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={getMetodoNombre(gar.id_metodo)} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Activa" 
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
                      onClick={() => { setDetailGarantia(gar); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(gar)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(gar.id_prestamo, gar.id_metodo)}
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
            count={filteredGarantias.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Préstamo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Método de Garantía</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Valor Garantía</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGarantias.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((gar) => {
                const prestamo = prestamos.find((p) => p.id_prestamo === gar.id_prestamo);
                return (
                  <TableRow key={`${gar.id_prestamo}-${gar.id_metodo}`} hover>
                    <TableCell>
                      <Typography variant="body2">{prestamo ? `#${prestamo.id_prestamo}` : gar.id_prestamo}</Typography>
                      {prestamo && (
                        <Typography variant="caption" color="text.secondary">{formatCurrency(prestamo.monto)}</Typography>
                      )}
                    </TableCell>
                    <TableCell>{getMetodoNombre(gar.id_metodo)}</TableCell>
                    <TableCell>{formatCurrency(gar.valor_garantia)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="info" size="small" onClick={() => { setDetailGarantia(gar); setDetailOpen(true); }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(gar)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(gar.id_prestamo, gar.id_metodo)}>
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
            count={filteredGarantias.length}
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
        <DialogTitle>Detalles de la Garantía</DialogTitle>
        <DialogContent dividers>
          {detailGarantia ? (
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="subtitle2">Préstamo</Typography>
              <Typography variant="body2">{detailGarantia.id_prestamo}</Typography>
              <Typography variant="subtitle2">Método</Typography>
              <Typography variant="body2">{getMetodoNombre(detailGarantia.id_metodo)}</Typography>
              <Typography variant="subtitle2">Valor</Typography>
              <Typography variant="body2">{formatCurrency(detailGarantia.valor_garantia)}</Typography>
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
        <DialogTitle>{selectedGarantia ? 'Editar Garantía' : 'Nueva Garantía'}</DialogTitle>
        <Formik
          initialValues={{
            id_prestamo: selectedGarantia?.id_prestamo || '',
            id_metodo: selectedGarantia?.id_metodo || '',
            valor_garantia: selectedGarantia?.valor_garantia || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={prestamos}
                    getOptionLabel={(option) => `Préstamo #${option.id_prestamo} - ${formatCurrency(option.monto)}`}
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

                  <Autocomplete
                    options={metodos}
                    getOptionLabel={(option) => option.nombre_metodo}
                    value={metodos.find((m) => m.id_metodo === values.id_metodo) || null}
                    onChange={(e, newValue) => setFieldValue('id_metodo', newValue ? newValue.id_metodo : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Método de Garantía"
                        required
                        error={touched.id_metodo && Boolean(errors.id_metodo)}
                        helperText={touched.id_metodo && errors.id_metodo}
                      />
                    )}
                  />

                  <Field name="valor_garantia">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Valor de la Garantía (Q)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        error={touched.valor_garantia && Boolean(errors.valor_garantia)}
                        helperText={touched.valor_garantia && errors.valor_garantia}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedGarantia ? 'Actualizar' : 'Crear'}
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

export default PrestamoGarantia;
