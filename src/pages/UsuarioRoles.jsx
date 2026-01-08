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
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { usuarioRolesService, usuariosService, rolesService, carterasService } from '../services/api';

const validationSchema = Yup.object({
  id_usuario: Yup.number().required('El usuario es requerido'),
  id_rol: Yup.number().required('El rol es requerido'),
  id_cartera: Yup.number().nullable().notRequired(),
});

function UsuarioRoles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [asignaciones, setAsignaciones] = useState([]);
  const [filteredAsignaciones, setFilteredAsignaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [carteras, setCarteras] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAsignacion, setDetailAsignacion] = useState(null);

  useEffect(() => {
    loadAsignaciones();
    loadUsuarios();
    loadRoles();
    loadCarteras();
  }, []);

  useEffect(() => {
    const filtered = asignaciones.filter((asig) => {
      const usuario = usuarios.find((u) => u.id_usuario === asig.id_usuario);
      const rol = roles.find((r) => r.id_rol === asig.id_rol);
      const cartera = carteras.find((c) => c.id_cartera === asig.id_cartera);
      return (
        usuario?.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rol?.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cartera?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredAsignaciones(filtered);
    setPage(0);
  }, [searchTerm, asignaciones, usuarios, roles, carteras]);

  const loadAsignaciones = async () => {
    try {
      const data = await usuarioRolesService.getAll();
      setAsignaciones(data);
      setFilteredAsignaciones(data);
    } catch (error) {
      showSnackbar('Error al cargar asignaciones', 'error');
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await rolesService.getAll();
      setRoles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadCarteras = async () => {
    try {
      const data = await carterasService.getAll();
      setCarteras(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getUsuarioNombre = (idUsuario) => {
    const usuario = usuarios.find((u) => u.id_usuario === idUsuario);
    return usuario ? `${usuario.nombre} ${usuario.apellido} (${usuario.usuario})` : '-';
  };

  const getRolNombre = (idRol) => {
    const rol = roles.find((r) => r.id_rol === idRol);
    return rol ? rol.nombre_rol : '-';
  };

  const getCarteraNombre = (idCartera) => {
    if (!idCartera) return 'Sin cartera asignada';
    const cartera = carteras.find((c) => c.id_cartera === idCartera);
    return cartera ? cartera.nombre : '-';
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await usuarioRolesService.create(values);
      showSnackbar('Asignación creada exitosamente', 'success');
      handleCloseDialog();
      resetForm();
      loadAsignaciones();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar asignación', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idUsuario, idRol, idCartera) => {
    if (window.confirm('¿Está seguro de eliminar esta asignación?')) {
      try {
        await usuarioRolesService.delete(idUsuario, idRol, idCartera);
        showSnackbar('Asignación eliminada exitosamente', 'success');
        loadAsignaciones();
      } catch (error) {
        showSnackbar('Error al eliminar asignación', 'error');
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
          Usuario - Roles
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
          sx={{ textTransform: 'none' }}
        >
          Nueva Asignación
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <TextField
            placeholder="Buscar asignaciones..."
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
          {filteredAsignaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asig) => {
            const usuarioNombre = getUsuarioNombre(asig.id_usuario);
            const rolNombre = getRolNombre(asig.id_rol);
            const carteraNombre = getCarteraNombre(asig.id_cartera);
            return (
              <Card key={`${asig.id_usuario}-${asig.id_rol}-${asig.id_cartera}`} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {usuarioNombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Asignación de Rol y Cartera
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {rolNombre} - {carteraNombre}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={rolNombre}
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={carteraNombre}
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
                      onClick={() => {
                        setDetailAsignacion(asig);
                        setDetailOpen(true);
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(asig.id_usuario, asig.id_rol, asig.id_cartera)}
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
            count={filteredAsignaciones.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cartera</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAsignaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asig) => {
                const usuarioNombre = getUsuarioNombre(asig.id_usuario);
                const rolNombre = getRolNombre(asig.id_rol);
                const carteraNombre = getCarteraNombre(asig.id_cartera);
                return (
                  <TableRow key={`${asig.id_usuario}-${asig.id_rol}-${asig.id_cartera}`} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {usuarioNombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rolNombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {carteraNombre}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => {
                          setDetailAsignacion(asig);
                          setDetailOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(asig.id_usuario, asig.id_rol, asig.id_cartera)}
                      >
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
            count={filteredAsignaciones.length}
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
        <DialogTitle>Detalles de Asignación</DialogTitle>
        <DialogContent>
          {detailAsignacion && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Usuario:</Typography>
                <Typography variant="body1">{getUsuarioNombre(detailAsignacion.id_usuario)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Rol:</Typography>
                <Typography variant="body1">{getRolNombre(detailAsignacion.id_rol)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Cartera:</Typography>
                <Typography variant="body1">{getCarteraNombre(detailAsignacion.id_cartera)}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Asignación Usuario-Rol</DialogTitle>
        <Formik
          initialValues={{
            id_usuario: '',
            id_rol: '',
            id_cartera: null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={usuarios}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido} (${option.usuario})`}
                    value={usuarios.find((u) => u.id_usuario === values.id_usuario) || null}
                    onChange={(e, newValue) => setFieldValue('id_usuario', newValue ? newValue.id_usuario : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Usuario"
                        required
                        error={touched.id_usuario && Boolean(errors.id_usuario)}
                        helperText={touched.id_usuario && errors.id_usuario}
                      />
                    )}
                  />

                  <Autocomplete
                    options={roles}
                    getOptionLabel={(option) => option.nombre_rol}
                    value={roles.find((r) => r.id_rol === values.id_rol) || null}
                    onChange={(e, newValue) => setFieldValue('id_rol', newValue ? newValue.id_rol : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Rol"
                        required
                        error={touched.id_rol && Boolean(errors.id_rol)}
                        helperText={touched.id_rol && errors.id_rol}
                      />
                    )}
                  />

                  <Autocomplete
                    options={carteras}
                    getOptionLabel={(option) => `${option.nombre} - ${option.descripcion}`}
                    value={carteras.find((c) => c.id_cartera === values.id_cartera) || null}
                    onChange={(e, newValue) => setFieldValue('id_cartera', newValue ? newValue.id_cartera : null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cartera (Opcional)"
                        error={touched.id_cartera && Boolean(errors.id_cartera)}
                        helperText={touched.id_cartera ? errors.id_cartera : 'Deja vacío si el usuario no necesita cartera asignada'}
                      />
                    )}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Crear
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

export default UsuarioRoles;
