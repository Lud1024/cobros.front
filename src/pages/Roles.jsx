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
  AdminPanelSettings as AdminIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { rolesService } from '../services/api';

const validationSchema = Yup.object({
  nombre_rol: Yup.string().required('El nombre del rol es requerido').max(100),
  permisos: Yup.string().nullable(),
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

  const renderPermisos = (perm) => {
    if (!perm && perm !== 0) return '-';
    if (typeof perm === 'string') return perm;
    if (typeof perm === 'object') {
      try {
        const keys = Object.entries(perm)
          .filter(([k, v]) => v === true || v === 'true')
          .map(([k]) => k);
        if (keys.length) return keys.join(', ');
        return JSON.stringify(perm);
      } catch (e) {
        return String(perm);
      }
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
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRol(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedRol) {
        await rolesService.update(selectedRol.id_rol, values);
        showSnackbar('Rol actualizado exitosamente', 'success');
      } else {
        await rolesService.create(values);
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
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Nombre del Rol</Typography>
                <Typography variant="body2">{detailRol.nombre_rol}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Permisos</Typography>
                <Typography variant="body2">{renderPermisos(detailRol.permisos)}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailRol(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRol ? 'Editar Rol' : 'Nuevo Rol'}</DialogTitle>
        <Formik
          initialValues={{
            nombre_rol: selectedRol?.nombre_rol || '',
            permisos: selectedRol?.permisos || '',
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
                  <Field name="permisos">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Permisos (JSON)"
                        fullWidth
                        multiline
                        rows={4}
                        error={touched.permisos && Boolean(errors.permisos)}
                        helperText={touched.permisos && errors.permisos}
                      />
                    )}
                  </Field>
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
