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
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { metodosGarantiaService } from '../services/api';

const validationSchema = Yup.object({
  nombre_metodo: Yup.string()
    .required('El nombre del método es requerido')
    .max(100, 'Máximo 100 caracteres'),
  descripcion: Yup.string()
    .max(255, 'Máximo 255 caracteres')
    .nullable(),
});

function MetodosGarantia() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [metodos, setMetodos] = useState([]);
  const [filteredMetodos, setFilteredMetodos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMetodo, setSelectedMetodo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMetodo, setDetailMetodo] = useState(null);

  useEffect(() => {
    loadMetodos();
  }, []);

  useEffect(() => {
    const filtered = metodos.filter((metodo) =>
      metodo.nombre_metodo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (metodo.descripcion && metodo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMetodos(filtered);
    setPage(0);
  }, [searchTerm, metodos]);

  const loadMetodos = async () => {
    try {
      const data = await metodosGarantiaService.getAll();
      setMetodos(data);
      setFilteredMetodos(data);
    } catch (error) {
      showSnackbar('Error al cargar métodos de garantía', 'error');
    }
  };

  const handleOpenDialog = (metodo = null) => {
    setSelectedMetodo(metodo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMetodo(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedMetodo) {
        await metodosGarantiaService.update(selectedMetodo.id_metodo, values);
        showSnackbar('Método actualizado exitosamente', 'success');
      } else {
        await metodosGarantiaService.create(values);
        showSnackbar('Método creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadMetodos();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Error al guardar método',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este método de garantía?')) {
      try {
        await metodosGarantiaService.delete(id);
        showSnackbar('Método eliminado exitosamente', 'success');
        loadMetodos();
      } catch (error) {
        showSnackbar('Error al eliminar método', 'error');
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
        <Typography variant="h5" component="h1">
          Métodos de Garantía
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Nuevo Método
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar métodos..."
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
          {filteredMetodos
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((metodo) => (
              <Card key={metodo.id_metodo} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {metodo.nombre_metodo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {metodo.id_metodo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <SecurityIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {metodo.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Garantía" 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label="Activo" 
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
                      onClick={() => { setDetailMetodo(metodo); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(metodo)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(metodo.id_metodo)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          <TablePagination
            component="div"
            count={filteredMetodos.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre del Método</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMetodos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((metodo) => (
                  <TableRow key={metodo.id_metodo} hover>
                    <TableCell>
                      <Typography variant="body2">{metodo.id_metodo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {metodo.nombre_metodo}
                      </Typography>
                    </TableCell>
                    <TableCell>{metodo.descripcion || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => { setDetailMetodo(metodo); setDetailOpen(true); }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(metodo)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(metodo.id_metodo)}
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
            count={filteredMetodos.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
          />
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailMetodo(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Método de Garantía</DialogTitle>
        <DialogContent dividers>
          {detailMetodo ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Nombre del Método</Typography>
                <Typography variant="body2">{detailMetodo.nombre_metodo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Descripción</Typography>
                <Typography variant="body2">{detailMetodo.descripcion || 'Sin descripción'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailMetodo(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMetodo ? 'Editar Método de Garantía' : 'Nuevo Método de Garantía'}
        </DialogTitle>
        <Formik
          initialValues={{
            nombre_metodo: selectedMetodo?.nombre_metodo || '',
            descripcion: selectedMetodo?.descripcion || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Field name="nombre_metodo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre del Método"
                        fullWidth
                        required
                        error={touched.nombre_metodo && Boolean(errors.nombre_metodo)}
                        helperText={touched.nombre_metodo && errors.nombre_metodo}
                      />
                    )}
                  </Field>

                  <Field name="descripcion">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        error={touched.descripcion && Boolean(errors.descripcion)}
                        helperText={touched.descripcion && errors.descripcion}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedMetodo ? 'Actualizar' : 'Crear'}
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

export default MetodosGarantia;
