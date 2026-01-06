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
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { periodicidadesService } from '../services/api';

const validationSchema = Yup.object({
  codigo: Yup.string()
    .required('El código es requerido')
    .max(50, 'Máximo 50 caracteres'),
  dias: Yup.number()
    .required('Los días son requeridos')
    .integer('Debe ser un número entero')
    .min(1, 'Debe ser al menos 1 día'),
});

function Periodicidades() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [periodicidades, setPeriodicidades] = useState([]);
  const [filteredPeriodicidades, setFilteredPeriodicidades] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPeriodicidad, setSelectedPeriodicidad] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPeriodicidad, setDetailPeriodicidad] = useState(null);

  useEffect(() => {
    loadPeriodicidades();
  }, []);

  useEffect(() => {
    const filtered = periodicidades.filter((periodicidad) =>
      periodicidad.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      periodicidad.dias.toString().includes(searchTerm)
    );
    setFilteredPeriodicidades(filtered);
    setPage(0);
  }, [searchTerm, periodicidades]);

  const loadPeriodicidades = async () => {
    try {
      const data = await periodicidadesService.getAll();
      setPeriodicidades(data);
      setFilteredPeriodicidades(data);
    } catch (error) {
      showSnackbar('Error al cargar periodicidades', 'error');
    }
  };

  const handleOpenDialog = (periodicidad = null) => {
    setSelectedPeriodicidad(periodicidad);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPeriodicidad(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedPeriodicidad) {
        await periodicidadesService.update(selectedPeriodicidad.id_periodicidad, values);
        showSnackbar('Periodicidad actualizada exitosamente', 'success');
      } else {
        await periodicidadesService.create(values);
        showSnackbar('Periodicidad creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadPeriodicidades();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Error al guardar periodicidad',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta periodicidad?')) {
      try {
        await periodicidadesService.delete(id);
        showSnackbar('Periodicidad eliminada exitosamente', 'success');
        loadPeriodicidades();
      } catch (error) {
        showSnackbar('Error al eliminar periodicidad', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFrequencyText = (dias) => {
    if (dias === 7) return 'Semanal';
    if (dias === 14 || dias === 15) return 'Quincenal';
    if (dias === 30) return 'Mensual';
    if (dias === 60) return 'Bimestral';
    if (dias === 90) return 'Trimestral';
    if (dias === 365) return 'Anual';
    return `Cada ${dias} días`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Periodicidades de Pago
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nueva Periodicidad
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar periodicidades..."
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
          {filteredPeriodicidades
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((periodicidad) => (
              <Card key={periodicidad.id_periodicidad} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {periodicidad.codigo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {periodicidad.id_periodicidad}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {getFrequencyText(periodicidad.dias)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${periodicidad.dias} días`}
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Periodicidad" 
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
                      onClick={() => { setDetailPeriodicidad(periodicidad); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(periodicidad)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(periodicidad.id_periodicidad)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          <TablePagination
            component="div"
            count={filteredPeriodicidades.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Código</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Días</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Frecuencia</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPeriodicidades
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((periodicidad) => (
                  <TableRow key={periodicidad.id_periodicidad} hover>
                    <TableCell>
                      <Typography variant="body2">{periodicidad.id_periodicidad}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {periodicidad.codigo}
                      </Typography>
                    </TableCell>
                    <TableCell>{periodicidad.dias}</TableCell>
                    <TableCell>
                      {getFrequencyText(periodicidad.dias)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => { setDetailPeriodicidad(periodicidad); setDetailOpen(true); }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(periodicidad)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(periodicidad.id_periodicidad)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredPeriodicidades.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
          />
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailPeriodicidad(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Periodicidad</DialogTitle>
        <DialogContent dividers>
          {detailPeriodicidad ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Código</Typography>
                <Typography variant="body2">{detailPeriodicidad.codigo}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Días</Typography>
                <Typography variant="body2">{detailPeriodicidad.dias}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Frecuencia</Typography>
                <Typography variant="body2">
                  {detailPeriodicidad.dias === 7 && 'Semanal'}
                  {detailPeriodicidad.dias === 14 && 'Quincenal'}
                  {detailPeriodicidad.dias === 15 && 'Quincenal'}
                  {detailPeriodicidad.dias === 30 && 'Mensual'}
                  {detailPeriodicidad.dias === 60 && 'Bimestral'}
                  {detailPeriodicidad.dias === 90 && 'Trimestral'}
                  {detailPeriodicidad.dias === 365 && 'Anual'}
                  {![7, 14, 15, 30, 60, 90, 365].includes(detailPeriodicidad.dias) && `Cada ${detailPeriodicidad.dias} días`}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailPeriodicidad(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPeriodicidad ? 'Editar Periodicidad' : 'Nueva Periodicidad'}
        </DialogTitle>
        <Formik
          initialValues={{
            codigo: selectedPeriodicidad?.codigo || '',
            dias: selectedPeriodicidad?.dias || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Field name="codigo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Código"
                        fullWidth
                        required
                        error={touched.codigo && Boolean(errors.codigo)}
                        helperText={touched.codigo && errors.codigo}
                      />
                    )}
                  </Field>

                  <Field name="dias">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Días"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ min: '1', step: '1' }}
                        error={touched.dias && Boolean(errors.dias)}
                        helperText={touched.dias && errors.dias}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedPeriodicidad ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Periodicidades;
