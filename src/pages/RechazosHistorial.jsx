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
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { rechazosHistorialService, verificacionesPrestamoService } from '../services/api';

const validationSchema = Yup.object({
  id_verificacion: Yup.number().required('La verificación es requerida'),
  motivo: Yup.string().required('El motivo es requerido'),
});

function RechazosHistorial() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rechazos, setRechazos] = useState([]);
  const [filteredRechazos, setFilteredRechazos] = useState([]);
  const [verificaciones, setVerificaciones] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRechazo, setSelectedRechazo] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRechazo, setDetailRechazo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    loadRechazos();
    loadVerificaciones();
  }, []);

  useEffect(() => {
    const filtered = rechazos.filter((rec) =>
      rec.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id_verificacion.toString().includes(searchTerm)
    );
    setFilteredRechazos(filtered);
    setPage(0);
  }, [searchTerm, rechazos]);

  const loadRechazos = async () => {
    try {
      const data = await rechazosHistorialService.getAll();
      setRechazos(data);
      setFilteredRechazos(data);
    } catch (error) {
      showSnackbar('Error al cargar rechazos', 'error');
    }
  };

  const loadVerificaciones = async () => {
    try {
      const data = await verificacionesPrestamoService.getAll();
      setVerificaciones(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDialog = (rechazo = null) => {
    setSelectedRechazo(rechazo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRechazo(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedRechazo) {
        await rechazosHistorialService.update(selectedRechazo.id_rechazo, values);
        showSnackbar('Rechazo actualizado exitosamente', 'success');
      } else {
        await rechazosHistorialService.create(values);
        showSnackbar('Rechazo creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadRechazos();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar rechazo', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este rechazo?')) {
      try {
        await rechazosHistorialService.delete(id);
        showSnackbar('Rechazo eliminado exitosamente', 'success');
        loadRechazos();
      } catch (error) {
        showSnackbar('Error al eliminar rechazo', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Historial de Rechazos
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={() => navigate('/app/rechazos-historial/nuevo')}
          sx={{ textTransform: 'none' }}
        >
          Nuevo Rechazo
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Buscar rechazos..."
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
          {filteredRechazos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rec) => {
            const verificacion = verificaciones.find((v) => v.id_verificacion === rec.id_verificacion);
            return (
              <Card key={rec.id_rechazo} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {verificacion ? `Verificación #${verificacion.id_verificacion}` : `Verificación #${rec.id_verificacion}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {rec.id_rechazo} | {verificacion?.analista || '-'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CancelIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {rec.motivo}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={rec.fecha_rechazo ? new Date(rec.fecha_rechazo).toLocaleDateString('es-GT') : 'Sin fecha'} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Rechazado" 
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
                      onClick={() => {
                        setDetailRechazo(rec);
                        setDetailOpen(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(rec)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(rec.id_rechazo)}
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
            count={filteredRechazos.length}
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
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Verificación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Motivo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRechazos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rec) => {
                const verificacion = verificaciones.find((v) => v.id_verificacion === rec.id_verificacion);
                return (
                  <TableRow key={rec.id_rechazo} hover>
                    <TableCell>{rec.id_rechazo}</TableCell>
                    <TableCell>{verificacion ? `Verificación #${verificacion.id_verificacion} - ${verificacion.analista}` : rec.id_verificacion}</TableCell>
                    <TableCell>{rec.motivo}</TableCell>
                    <TableCell>
                      {rec.fecha_rechazo ? new Date(rec.fecha_rechazo).toLocaleDateString('es-GT') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => {
                          setDetailRechazo(rec);
                          setDetailOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(rec)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDelete(rec.id_rechazo)}>
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
            count={filteredRechazos.length}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Rechazo</DialogTitle>
        <DialogContent>
          {detailRechazo && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">ID:</Typography>
                <Typography variant="body1">{detailRechazo.id_rechazo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Verificación:</Typography>
                <Typography variant="body1">
                  {(() => {
                    const verificacion = verificaciones.find((v) => v.id_verificacion === detailRechazo.id_verificacion);
                    return verificacion ? `Verificación #${verificacion.id_verificacion} - ${verificacion.analista}` : detailRechazo.id_verificacion;
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Motivo:</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{detailRechazo.motivo}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Fecha Rechazo:</Typography>
                <Typography variant="body1">
                  {detailRechazo.fecha_rechazo ? new Date(detailRechazo.fecha_rechazo).toLocaleDateString('es-GT') : '-'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRechazo ? 'Editar Rechazo' : 'Nuevo Rechazo'}</DialogTitle>
        <Formik
          initialValues={{
            id_verificacion: selectedRechazo?.id_verificacion || '',
            motivo: selectedRechazo?.motivo || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={verificaciones}
                    getOptionLabel={(option) => `Verificación #${option.id_verificacion} - ${option.analista}`}
                    value={verificaciones.find((v) => v.id_verificacion === values.id_verificacion) || null}
                    onChange={(e, newValue) =>
                      setFieldValue('id_verificacion', newValue ? newValue.id_verificacion : '')
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Verificación"
                        required
                        error={touched.id_verificacion && Boolean(errors.id_verificacion)}
                        helperText={touched.id_verificacion && errors.id_verificacion}
                      />
                    )}
                  />

                  <Field name="motivo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Motivo del Rechazo"
                        fullWidth
                        required
                        multiline
                        rows={4}
                        error={touched.motivo && Boolean(errors.motivo)}
                        helperText={touched.motivo && errors.motivo}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedRechazo ? 'Actualizar' : 'Crear'}
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

export default RechazosHistorial;
