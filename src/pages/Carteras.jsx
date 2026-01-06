import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Folder,
  Visibility,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { carterasService } from '../services/api';

const validationSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(3, 'Mínimo 3 caracteres'),
  descripcion: Yup.string()
    .nullable(),
});

const Carteras = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [carteras, setCarteras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCartera, setSelectedCartera] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCartera, setDetailCartera] = useState(null);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      descripcion: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        if (editMode && selectedCartera) {
          await carterasService.update(selectedCartera.id_cartera, values);
          enqueueSnackbar('Cartera actualizada exitosamente', { variant: 'success' });
        } else {
          await carterasService.create(values);
          enqueueSnackbar('Cartera creada exitosamente', { variant: 'success' });
        }
        handleClose();
        resetForm();
        fetchCarteras();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.error || 'Error al guardar cartera',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchCarteras = async () => {
    try {
      setLoading(true);
      const data = await carterasService.getAll();
      setCarteras(data);
    } catch (error) {
      console.error('Error cargando carteras:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar carteras', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarteras();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setSelectedCartera(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleEdit = (cartera) => {
    setEditMode(true);
    setSelectedCartera(cartera);
    formik.setValues({
      nombre: cartera.nombre || '',
      descripcion: cartera.descripcion || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedCartera(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cartera?')) {
      try {
        await carterasService.delete(id);
        enqueueSnackbar('Cartera eliminada exitosamente', { variant: 'success' });
        fetchCarteras();
      } catch (error) {
        enqueueSnackbar('Error al eliminar cartera', { variant: 'error' });
      }
    }
  };

  const filteredCarteras = carteras.filter((cartera) =>
    `${cartera.nombre} ${cartera.descripcion || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestión de Carteras
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{ textTransform: 'none' }}
        >
          Nueva Cartera
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar carteras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {isMobile ? (
        // Vista de tarjetas para móvil
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography align="center">Cargando...</Typography>
              </CardContent>
            </Card>
          ) : filteredCarteras.length === 0 ? (
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography align="center">No se encontraron carteras</Typography>
              </CardContent>
            </Card>
          ) : (
            filteredCarteras.map((cartera) => (
              <Card key={cartera.id_cartera} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {cartera.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {cartera.id_cartera}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Folder fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {cartera.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label="Cartera" 
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
                      onClick={() => { setDetailCartera(cartera); setDetailOpen(true); }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(cartera)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(cartera.id_cartera)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        // Vista de tabla para escritorio
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredCarteras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No se encontraron carteras
                  </TableCell>
                </TableRow>
              ) : (
                filteredCarteras.map((cartera) => (
                  <TableRow key={cartera.id_cartera} hover>
                    <TableCell>
                      <Typography variant="body2">{cartera.id_cartera}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Folder color="primary" />
                        <Typography variant="body2" fontWeight="medium">
                          {cartera.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cartera.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => { setDetailCartera(cartera); setDetailOpen(true); }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(cartera)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cartera.id_cartera)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailCartera(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Cartera</DialogTitle>
        <DialogContent dividers>
          {detailCartera ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Nombre</Typography>
                <Typography variant="body2">{detailCartera.nombre}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Descripción</Typography>
                <Typography variant="body2">{detailCartera.descripcion || 'Sin descripción'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailCartera(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Cartera' : 'Nueva Cartera'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="nombre"
                  name="nombre"
                  label="Nombre de la Cartera *"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="descripcion"
                  name="descripcion"
                  label="Descripción"
                  multiline
                  rows={3}
                  value={formik.values.descripcion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                  helperText={formik.touched.descripcion && formik.errors.descripcion}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Carteras;
