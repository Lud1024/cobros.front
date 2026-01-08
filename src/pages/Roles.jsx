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
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  SupervisedUserCircle as UsersIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { rolesService } from '../services/api';

// Definición de módulos con sus permisos asociados
const modulosPermisos = [
  {
    modulo: 'clientes',
    label: 'Clientes',
    descripcion: 'Gestión de clientes y sus documentos',
    icon: <PeopleIcon />,
    color: 'primary',
    permisos: ['ver_clientes', 'crear_clientes', 'editar_clientes', 'eliminar_clientes', 'ver_documentos', 'gestionar_documentos']
  },
  {
    modulo: 'prestamos',
    label: 'Préstamos',
    descripcion: 'Préstamos, garantías y verificaciones',
    icon: <AccountBalanceIcon />,
    color: 'secondary',
    permisos: ['ver_prestamos', 'crear_prestamos', 'editar_prestamos', 'eliminar_prestamos', 'gestionar_garantias', 'verificar_prestamos', 'rechazar_prestamos']
  },
  {
    modulo: 'pagos',
    label: 'Pagos y Cuotas',
    descripcion: 'Gestión de pagos, cuotas y aplicaciones',
    icon: <PaymentIcon />,
    color: 'success',
    permisos: ['ver_pagos', 'crear_pagos', 'editar_pagos', 'eliminar_pagos', 'aplicar_pagos', 'ver_cuotas', 'gestionar_cuotas']
  },
  {
    modulo: 'mora',
    label: 'Mora y Cobro',
    descripcion: 'Eventos de mora, políticas y visitas',
    icon: <WarningIcon />,
    color: 'warning',
    permisos: ['ver_mora', 'gestionar_mora', 'ver_politicas', 'editar_politicas', 'ver_visitas', 'crear_visitas']
  },
  {
    modulo: 'configuracion',
    label: 'Configuración',
    descripcion: 'Carteras, métodos de garantía y periodicidades',
    icon: <SettingsIcon />,
    color: 'info',
    permisos: ['ver_carteras', 'gestionar_carteras', 'ver_metodos_garantia', 'gestionar_metodos_garantia', 'ver_periodicidades', 'gestionar_periodicidades']
  },
  {
    modulo: 'usuarios',
    label: 'Usuarios y Roles',
    descripcion: 'Administración de usuarios y roles',
    icon: <UsersIcon />,
    color: 'error',
    permisos: ['ver_usuarios', 'crear_usuarios', 'editar_usuarios', 'eliminar_usuarios', 'ver_roles', 'gestionar_roles', 'asignar_roles']
  },
  {
    modulo: 'reportes',
    label: 'Reportes',
    descripcion: 'Generación y exportación de reportes',
    icon: <ReportsIcon />,
    color: 'default',
    permisos: ['ver_reportes', 'generar_reportes', 'exportar_reportes']
  },
];

const validationSchema = Yup.object({
  nombre_rol: Yup.string().required('El nombre del rol es requerido').max(100),
});

function Roles() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRol, setDetailRol] = useState(null);
  const [permisos, setPermisos] = useState({});

  const renderPermisos = (perm) => {
    if (!perm && perm !== 0) return '-';
    let permObj = perm;
    if (typeof perm === 'string') {
      try {
        permObj = JSON.parse(perm);
      } catch (e) {
        return perm;
      }
    }
    if (typeof permObj === 'object') {
      // Buscar módulos activos
      const modulosActivos = modulosPermisos
        .filter(m => permObj[m.modulo] === true)
        .map(m => m.label);
      
      if (modulosActivos.length > 0) {
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {modulosActivos.map(label => (
              <Chip key={label} label={label} size="small" variant="outlined" />
            ))}
          </Box>
        );
      }
      
      // Fallback para permisos antiguos
      const keys = Object.entries(permObj)
        .filter(([k, v]) => v === true || v === 'true')
        .map(([k]) => k);
      if (keys.length) {
        return keys.length > 3 ? `${keys.slice(0, 3).join(', ')}...` : keys.join(', ');
      }
      return '-';
    }
    return String(perm);
  };

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    const filtered = roles.filter((rol) =>
      rol.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
    setPage(0);
  }, [searchTerm, roles]);

  const loadRoles = async () => {
    try {
      const data = await rolesService.getAll();
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      showSnackbar('Error al cargar roles', 'error');
    }
  };

  const handleOpenDialog = (rol = null) => {
    setSelectedRol(rol);
    // Parsear permisos si existen
    if (rol && rol.permisos) {
      try {
        const parsedPermisos = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : rol.permisos;
        setPermisos(parsedPermisos);
      } catch (e) {
        setPermisos({});
      }
    } else {
      setPermisos({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRol(null);
    setPermisos({});
  };

  // Manejar cambio de módulo completo
  const handleModuloChange = (modulo, checked) => {
    const moduloInfo = modulosPermisos.find(m => m.modulo === modulo);
    if (!moduloInfo) return;
    
    // Si se activa el módulo, se activan todos sus permisos
    // Si se desactiva, se desactivan todos
    const newPermisos = { ...permisos };
    moduloInfo.permisos.forEach(permiso => {
      newPermisos[permiso] = checked;
    });
    // También guardamos el estado del módulo
    newPermisos[modulo] = checked;
    setPermisos(newPermisos);
  };

  // Verificar si un módulo está activo (tiene el flag del módulo o todos sus permisos)
  const isModuloActivo = (modulo) => {
    const moduloInfo = modulosPermisos.find(m => m.modulo === modulo);
    if (!moduloInfo) return false;
    // Verificamos si el módulo está explícitamente activo
    return Boolean(permisos[modulo]);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const dataToSend = {
        ...values,
        permisos: JSON.stringify(permisos)
      };
      
      if (selectedRol) {
        await rolesService.update(selectedRol.id_rol, dataToSend);
        showSnackbar('Rol actualizado exitosamente', 'success');
      } else {
        await rolesService.create(dataToSend);
        showSnackbar('Rol creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadRoles();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error al guardar rol', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este rol?')) {
      try {
        await rolesService.delete(id);
        showSnackbar('Rol eliminado exitosamente', 'success');
        loadRoles();
      } catch (error) {
        showSnackbar('Error al eliminar rol', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Roles y Permisos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nuevo Rol
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar roles..."
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
          {filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rol) => (
            <Card key={rol.id_rol} elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {rol.nombre_rol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ID: {rol.id_rol}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AdminIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {renderPermisos(rol.permisos)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Rol" 
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
                    onClick={() => { setDetailRol(rol); setDetailOpen(true); }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(rol)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(rol.id_rol)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
          <TablePagination
            component="div"
            count={filteredRoles.length}
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre del Rol</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Permisos</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rol) => (
                <TableRow key={rol.id_rol} hover>
                  <TableCell>
                    <Typography variant="body2">{rol.id_rol}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {rol.nombre_rol}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderPermisos(rol.permisos)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="info" size="small" onClick={() => { setDetailRol(rol); setDetailOpen(true); }}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleOpenDialog(rol)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(rol.id_rol)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredRoles.length}
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailRol(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles del Rol</DialogTitle>
        <DialogContent dividers>
          {detailRol ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Nombre del Rol</Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>{detailRol.nombre_rol}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Módulos con Acceso</Typography>
              <Grid container spacing={1}>
                {(() => {
                  let permObj = detailRol.permisos;
                  if (typeof permObj === 'string') {
                    try { permObj = JSON.parse(permObj); } catch (e) { permObj = {}; }
                  }
                  return modulosPermisos.map(m => (
                    <Grid item xs={6} key={m.modulo}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        opacity: permObj?.[m.modulo] ? 1 : 0.4
                      }}>
                        <Box sx={{ color: permObj?.[m.modulo] ? `${m.color}.main` : 'action.disabled' }}>
                          {m.icon}
                        </Box>
                        <Typography variant="body2">
                          {m.label}
                        </Typography>
                        {permObj?.[m.modulo] && (
                          <Chip label="✓" size="small" color="success" sx={{ ml: 'auto', minWidth: 24 }} />
                        )}
                      </Box>
                    </Grid>
                  ));
                })()}
              </Grid>
            </Box>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailRol(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRol ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
        <Formik
          initialValues={{
            nombre_rol: selectedRol?.nombre_rol || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Field name="nombre_rol">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre del Rol"
                        fullWidth
                        required
                        error={touched.nombre_rol && Boolean(errors.nombre_rol)}
                        helperText={touched.nombre_rol && errors.nombre_rol}
                      />
                    )}
                  </Field>

                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                    Acceso por Módulos
                  </Typography>

                  <Grid container spacing={2}>
                    {modulosPermisos.map((modulo) => (
                      <Grid item xs={12} sm={6} key={modulo.modulo}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            height: '100%',
                            borderColor: isModuloActivo(modulo.modulo) ? `${modulo.color}.main` : 'divider',
                            bgcolor: isModuloActivo(modulo.modulo) ? `${modulo.color}.50` : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                color: isModuloActivo(modulo.modulo) ? `${modulo.color}.main` : 'action.disabled',
                                display: 'flex'
                              }}>
                                {modulo.icon}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {modulo.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {modulo.descripcion}
                                </Typography>
                              </Box>
                            </Box>
                            <Switch
                              checked={isModuloActivo(modulo.modulo)}
                              onChange={(e) => handleModuloChange(modulo.modulo, e.target.checked)}
                              color={modulo.color === 'default' ? 'primary' : modulo.color}
                            />
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {selectedRol ? 'Actualizar' : 'Crear'}
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

export default Roles;
