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
  Person,
  Visibility as VisibilityIcon,
  VisibilityOff,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { usuariosService } from '../services/api';

const validationSchema = Yup.object({
  usuario: Yup.string()
    .required('El usuario es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
  nombre: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'Mínimo 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es requerido')
    .min(2, 'Mínimo 2 caracteres'),
  correo: Yup.string()
    .email('Correo inválido')
    .required('El correo es requerido'),
  password: Yup.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .when('$isCreating', {
      is: true,
      then: (schema) => schema.required('La contraseña es requerida'),
      otherwise: (schema) => schema.nullable(),
    }),
  telefono: Yup.string()
    .matches(/^[0-9]{8}$/, 'Teléfono debe tener 8 dígitos')
    .nullable(),
});

const Usuarios = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUsuario, setDetailUsuario] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      usuario: '',
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      telefono: '',
    },
    validationSchema,
    context: { isCreating: !editMode },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const data = { ...values };
        // No enviar password si está vacío en modo edición
        if (editMode && !data.password) {
          delete data.password;
        }
        
        if (editMode && selectedUsuario) {
          await usuariosService.update(selectedUsuario.id_usuario, data);
          enqueueSnackbar('Usuario actualizado exitosamente', { variant: 'success' });
        } else {
          await usuariosService.create(data);
          enqueueSnackbar('Usuario creado exitosamente', { variant: 'success' });
        }
        handleClose();
        resetForm();
        fetchUsuarios();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.error || 'Error al guardar usuario',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar usuarios', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setSelectedUsuario(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleEdit = (usuario) => {
    setEditMode(true);
    setSelectedUsuario(usuario);
    formik.setValues({
      usuario: usuario.usuario || '',
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      password: '', // No mostrar password existente
      telefono: usuario.telefono || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedUsuario(null);
    setShowPassword(false);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usuariosService.delete(id);
        enqueueSnackbar('Usuario eliminado exitosamente', { variant: 'success' });
        fetchUsuarios();
      } catch (error) {
        enqueueSnackbar('Error al eliminar usuario', { variant: 'error' });
      }
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    `${usuario.nombre} ${usuario.apellido} ${usuario.usuario} ${usuario.correo}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleOpen}
          sx={{ textTransform: 'none' }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar usuarios..."
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
          ) : filteredUsuarios.length === 0 ? (
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography align="center">No se encontraron usuarios</Typography>
              </CardContent>
            </Card>
          ) : (
            filteredUsuarios.map((usuario) => (
              <Card key={usuario.id_usuario} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {usuario.nombre} {usuario.apellido}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {usuario.id_usuario} | @{usuario.usuario}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {usuario.correo}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={usuario.telefono || 'Sin teléfono'}
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={usuario.estado === 'A' ? 'Activo' : 'Inactivo'}
                        size="small" 
                        color={usuario.estado === 'A' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => { setDetailUsuario(usuario); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(usuario)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(usuario.id_usuario)}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre Completo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Correo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Teléfono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredUsuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id_usuario} hover>
                    <TableCell>
                      <Typography variant="body2">{usuario.id_usuario}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        <Typography variant="body2" fontWeight="medium">
                          {usuario.usuario}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {usuario.nombre} {usuario.apellido}
                    </TableCell>
                    <TableCell>{usuario.correo}</TableCell>
                    <TableCell>{usuario.telefono || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.estado === 'A' ? 'Activo' : 'Inactivo'}
                        color={usuario.estado === 'A' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => { setDetailUsuario(usuario); setDetailOpen(true); }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(usuario)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(usuario.id_usuario)}
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailUsuario(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Usuario</DialogTitle>
        <DialogContent dividers>
          {detailUsuario ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Usuario</Typography>
                <Typography variant="body2">{detailUsuario.usuario}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Nombre</Typography>
                <Typography variant="body2">{detailUsuario.nombre} {detailUsuario.apellido}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Teléfono</Typography>
                <Typography variant="body2">{detailUsuario.telefono || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Correo</Typography>
                <Typography variant="body2">{detailUsuario.correo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Estado</Typography>
                <Typography variant="body2">{detailUsuario.estado === 'A' ? 'Activo' : 'Inactivo'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailUsuario(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="usuario"
                  name="usuario"
                  label="Usuario *"
                  placeholder="usuario123"
                  value={formik.values.usuario}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.usuario && Boolean(formik.errors.usuario)}
                  helperText={formik.touched.usuario && formik.errors.usuario}
                  disabled={editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="correo"
                  name="correo"
                  label="Correo Electrónico *"
                  type="email"
                  value={formik.values.correo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.correo && Boolean(formik.errors.correo)}
                  helperText={formik.touched.correo && formik.errors.correo}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="nombre"
                  name="nombre"
                  label="Nombre *"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="apellido"
                  name="apellido"
                  label="Apellido *"
                  value={formik.values.apellido}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                  helperText={formik.touched.apellido && formik.errors.apellido}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="password"
                  name="password"
                  label={editMode ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="telefono"
                  name="telefono"
                  label="Teléfono (8 dígitos)"
                  placeholder="12345678"
                  value={formik.values.telefono}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                  helperText={formik.touched.telefono && formik.errors.telefono}
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

export default Usuarios;
