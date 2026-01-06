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
  Policy as PolicyIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { politicasMoraService, carterasService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const validationSchema = Yup.object({
  id_cartera: Yup.number().required('La cartera es requerida'),
  tasa_mora_diaria: Yup.number()
    .required('La tasa de mora es requerida')
    .min(0, 'Debe ser mayor o igual a 0')
    .max(100, 'Máximo 100%'),
  tope_mora: Yup.number()
    .required('El tope de mora es requerido')
    .min(0, 'Debe ser mayor o igual a 0'),
  vigente_desde: Yup.date().required('La fecha de inicio es requerida'),
  vigente_hasta: Yup.date()
    .nullable()
    .min(Yup.ref('vigente_desde'), 'Debe ser posterior a la fecha de inicio'),
});

function PoliticasMora() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [politicas, setPoliticas] = useState([]);
  const [filteredPoliticas, setFilteredPoliticas] = useState([]);
  const [carteras, setCarteras] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPolitica, setSelectedPolitica] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPolitica, setDetailPolitica] = useState(null);

  useEffect(() => {
    loadPoliticas();
    loadCarteras();
  }, []);

  useEffect(() => {
    const filtered = politicas.filter((politica) => {
      const cartera = carteras.find((c) => c.id_cartera === politica.id_cartera);
      return (
        cartera?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        politica.tasa_mora_diaria.toString().includes(searchTerm)
      );
    });
    setFilteredPoliticas(filtered);
    setPage(0);
  }, [searchTerm, politicas, carteras]);

  const loadPoliticas = async () => {
    try {
      const data = await politicasMoraService.getAll();
      setPoliticas(data);
      setFilteredPoliticas(data);
    } catch (error) {
      showSnackbar('Error al cargar políticas de mora', 'error');
    }
  };

  const loadCarteras = async () => {
    try {
      const data = await carterasService.getAll();
      setCarteras(data);
    } catch (error) {
      showSnackbar('Error al cargar carteras', 'error');
    }
  };

  const getCarteraNombre = (idCartera) => {
    const cartera = carteras.find((c) => c.id_cartera === idCartera);
    return cartera ? `${cartera.nombre}` : '-';
  };

  const isVigente = (vigente_desde, vigente_hasta) => {
    const hoy = new Date();
    const desde = new Date(vigente_desde);
    const hasta = vigente_hasta ? new Date(vigente_hasta) : null;
    return desde <= hoy && (!hasta || hasta >= hoy);
  };

  const handleOpenDialog = (politica = null) => {
    setSelectedPolitica(politica);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPolitica(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedPolitica) {
        await politicasMoraService.update(selectedPolitica.id_politica, values);
        showSnackbar('Política actualizada exitosamente', 'success');
      } else {
        await politicasMoraService.create(values);
        showSnackbar('Política creada exitosamente', 'success');
      }
      handleCloseDialog();
      loadPoliticas();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Error al guardar política',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta política de mora?')) {
      try {
        await politicasMoraService.delete(id);
        showSnackbar('Política eliminada exitosamente', 'success');
        loadPoliticas();
      } catch (error) {
        showSnackbar('Error al eliminar política', 'error');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Políticas de Mora
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nueva Política
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Buscar políticas..."
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
          {filteredPoliticas
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((politica) => (
              <Card key={politica.id_politica} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {getCarteraNombre(politica.id_cartera)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {politica.id_politica} | Tasa: {politica.tasa_mora_diaria}%
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PolicyIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Tope: {formatCurrency(politica.tope_mora)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={new Date(politica.vigente_desde).toLocaleDateString('es-GT')} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={isVigente(politica.vigente_desde, politica.vigente_hasta) ? 'Vigente' : 'No Vigente'} 
                        size="small" 
                        color={isVigente(politica.vigente_desde, politica.vigente_hasta) ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => {
                        setDetailPolitica(politica);
                        setDetailOpen(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(politica)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(politica.id_politica)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          <TablePagination
            component="div"
            count={filteredPoliticas.length}
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
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cartera</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tasa Mora Diaria (%)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tope Mora</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vigente Desde</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Vigente Hasta</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPoliticas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((politica) => (
                  <TableRow key={politica.id_politica} hover>
                    <TableCell>{politica.id_politica}</TableCell>
                    <TableCell>{getCarteraNombre(politica.id_cartera)}</TableCell>
                    <TableCell>{politica.tasa_mora_diaria}%</TableCell>
                    <TableCell>{formatCurrency(politica.tope_mora)}</TableCell>
                    <TableCell>{new Date(politica.vigente_desde).toLocaleDateString('es-GT')}</TableCell>
                    <TableCell>
                      {politica.vigente_hasta
                        ? new Date(politica.vigente_hasta).toLocaleDateString('es-GT')
                        : 'Indefinido'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isVigente(politica.vigente_desde, politica.vigente_hasta) ? 'Vigente' : 'No Vigente'}
                        color={isVigente(politica.vigente_desde, politica.vigente_hasta) ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => {
                          setDetailPolitica(politica);
                          setDetailOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(politica)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(politica.id_politica)}
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
            count={filteredPoliticas.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
          />
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de Política de Mora</DialogTitle>
        <DialogContent>
          {detailPolitica && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">ID:</Typography>
                <Typography variant="body1">{detailPolitica.id_politica}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Cartera:</Typography>
                <Typography variant="body1">{getCarteraNombre(detailPolitica.id_cartera)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Tasa Mora Diaria:</Typography>
                <Typography variant="body1">{detailPolitica.tasa_mora_diaria}%</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Tope Mora:</Typography>
                <Typography variant="body1">{formatCurrency(detailPolitica.tope_mora)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Vigente Desde:</Typography>
                <Typography variant="body1">{new Date(detailPolitica.vigente_desde).toLocaleDateString('es-GT')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Vigente Hasta:</Typography>
                <Typography variant="body1">
                  {detailPolitica.vigente_hasta
                    ? new Date(detailPolitica.vigente_hasta).toLocaleDateString('es-GT')
                    : 'Indefinido'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Estado:</Typography>
                <Chip
                  label={isVigente(detailPolitica.vigente_desde, detailPolitica.vigente_hasta) ? 'Vigente' : 'No Vigente'}
                  color={isVigente(detailPolitica.vigente_desde, detailPolitica.vigente_hasta) ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPolitica ? 'Editar Política de Mora' : 'Nueva Política de Mora'}
        </DialogTitle>
        <Formik
          initialValues={{
            id_cartera: selectedPolitica?.id_cartera || '',
            tasa_mora_diaria: selectedPolitica?.tasa_mora_diaria || '',
            tope_mora: selectedPolitica?.tope_mora || '',
            vigente_desde: selectedPolitica?.vigente_desde?.split('T')[0] || '',
            vigente_hasta: selectedPolitica?.vigente_hasta?.split('T')[0] || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={carteras}
                    getOptionLabel={(option) => `${option.nombre} - ${option.descripcion}`}
                    value={carteras.find((c) => c.id_cartera === values.id_cartera) || null}
                    onChange={(e, newValue) => {
                      setFieldValue('id_cartera', newValue ? newValue.id_cartera : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cartera"
                        required
                        error={touched.id_cartera && Boolean(errors.id_cartera)}
                        helperText={touched.id_cartera && errors.id_cartera}
                      />
                    )}
                  />

                  <Field name="tasa_mora_diaria">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Tasa de Mora Diaria (%)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0', max: '100' }}
                        error={touched.tasa_mora_diaria && Boolean(errors.tasa_mora_diaria)}
                        helperText={touched.tasa_mora_diaria && errors.tasa_mora_diaria}
                      />
                    )}
                  </Field>

                  <Field name="tope_mora">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Tope de Mora (Q)"
                        type="number"
                        fullWidth
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                        error={touched.tope_mora && Boolean(errors.tope_mora)}
                        helperText={touched.tope_mora && errors.tope_mora}
                      />
                    )}
                  </Field>

                  <Field name="vigente_desde">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Vigente Desde"
                        type="date"
                        fullWidth
                        required
                        InputLabelProps={{ shrink: true }}
                        error={touched.vigente_desde && Boolean(errors.vigente_desde)}
                        helperText={touched.vigente_desde && errors.vigente_desde}
                      />
                    )}
                  </Field>

                  <Field name="vigente_hasta">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Vigente Hasta"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={touched.vigente_hasta && Boolean(errors.vigente_hasta)}
                        helperText={touched.vigente_hasta && errors.vigente_hasta}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedPolitica ? 'Actualizar' : 'Crear'}
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

export default PoliticasMora;
