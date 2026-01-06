import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
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
  Skeleton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Description,
  Person,
  Folder,
  CalendarToday,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ResponsiveButton from '../components/ResponsiveButton';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { clienteDocumentosService, clientesService } from '../services/api';

const tiposDocumento = [
  'DPI',
  'Pasaporte',
  'Recibo de Luz',
  'Recibo de Agua',
  'Contrato de Alquiler',
  'Escritura',
  'Otro',
];

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  tipo_documento: Yup.string().required('El tipo de documento es requerido'),
  nombre_archivo: Yup.string().required('El nombre del archivo es requerido').max(255),
  ruta_storage: Yup.string().required('La ruta es requerida').max(500),
});

function ClienteDocumentos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [documentos, setDocumentos] = useState([]);
  const [filteredDocumentos, setFilteredDocumentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDocumento, setDetailDocumento] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, documento: null });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [docsData, clientesData] = await Promise.all([
        clienteDocumentosService.getAll(),
        clientesService.getAll(),
      ]);
      setDocumentos(docsData);
      setFilteredDocumentos(docsData);
      setClientes(clientesData);
    } catch (error) {
      showSnackbar('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filtered = documentos.filter((doc) => {
      const cliente = clientes.find((c) => c.id_cliente === doc.id_cliente);
      return (
        doc.tipo_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredDocumentos(filtered);
  }, [searchTerm, documentos, clientes]);

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id_cliente === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
  };

  const handleOpenDialog = (documento = null) => {
    // If a document is provided, open the edit dialog; otherwise navigate to create page
    if (documento) {
      setSelectedDocumento(documento);
      setOpenDialog(true);
    } else {
      navigate('/app/cliente-documentos/nuevo');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocumento(null);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailDocumento(null);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (selectedDocumento) {
        await clienteDocumentosService.update(selectedDocumento.id_documento, values);
        showSnackbar('Documento actualizado exitosamente', 'success');
      } else {
        await clienteDocumentosService.create(values);
        showSnackbar('Documento creado exitosamente', 'success');
      }
      handleCloseDialog();
      loadDocumentos();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || 'Error al guardar documento',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await clienteDocumentosService.delete(id);
      showSnackbar('Documento eliminado exitosamente', 'success');
      setDeleteConfirm({ open: false, documento: null });
      loadData();
    } catch (error) {
      showSnackbar('Error al eliminar documento', 'error');
    }
  };

  const handleDeleteClick = (documento) => {
    setDeleteConfirm({ open: true, documento });
  };

  const getTipoDocumentoColor = (tipo) => {
    const colores = {
      'DPI': 'primary',
      'Pasaporte': 'secondary',
      'Recibo de Luz': 'warning',
      'Recibo de Agua': 'info',
      'Contrato de Alquiler': 'success',
      'Escritura': 'error',
      'Otro': 'default',
    };
    return colores[tipo] || 'default';
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <PageHeader
        title="Documentos de Clientes"
        subtitle={`${filteredDocumentos.length} documento${filteredDocumentos.length !== 1 ? 's' : ''}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar">
              <IconButton onClick={loadData} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <ResponsiveButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/app/cliente-documentos/nuevo')}
            >
              Nuevo Documento
            </ResponsiveButton>
          </Box>
        }
      />

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            placeholder="Buscar documentos..."
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                '& input': {
                  fontSize: { xs: '16px', sm: 'inherit' },
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Vista móvil: Cards */}
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent sx={{ p: 2 }}>
                  <Skeleton width="50%" height={24} />
                  <Skeleton width="70%" height={20} sx={{ mt: 1 }} />
                  <Skeleton width="40%" height={18} />
                </CardContent>
              </Card>
            ))
          ) : filteredDocumentos.length === 0 ? (
            <EmptyState
              title="No se encontraron documentos"
              description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer documento para comenzar'}
              actionLabel="Nuevo Documento"
              onAction={() => navigate('/app/cliente-documentos/nuevo')}
            />
          ) : (
            filteredDocumentos.map((documento) => (
              <Card key={documento.id_documento} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {documento.nombre_archivo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID: {documento.id_documento} | {documento.tipo_documento}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Person fontSize="small" sx={{ fontSize: 14 }} color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {getClienteNombre(documento.id_cliente)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={documento.tipo_documento} 
                          size="small" 
                          color={getTipoDocumentoColor(documento.tipo_documento)}
                          variant="outlined"
                        />
                        <Chip 
                          label={documento.fecha_subida ? new Date(documento.fecha_subida).toLocaleDateString('es-GT') : 'Sin fecha'} 
                          size="small" 
                          color="default"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => { setDetailDocumento(documento); setDetailOpen(true); }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="info" onClick={() => handleOpenDialog(documento)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(documento)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        /* Vista desktop: Tabla */
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo Documento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre Archivo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(6)].map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredDocumentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron documentos</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocumentos.map((documento) => (
                  <TableRow key={documento.id_documento} hover>
                    <TableCell>{documento.id_documento}</TableCell>
                    <TableCell>{getClienteNombre(documento.id_cliente)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={documento.tipo_documento} 
                        size="small" 
                        color={getTipoDocumentoColor(documento.tipo_documento)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{documento.nombre_archivo}</TableCell>
                    <TableCell>
                      {documento.fecha_subida
                        ? new Date(documento.fecha_subida).toLocaleDateString('es-GT')
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => { setDetailDocumento(documento); setDetailOpen(true); }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenDialog(documento)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(documento)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Detalles del Documento</DialogTitle>
        <DialogContent dividers>
          {detailDocumento ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Nombre del Archivo</Typography>
                <Typography variant="body1" fontWeight={500}>{detailDocumento.nombre_archivo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Cliente</Typography>
                <Typography variant="body2">{getClienteNombre(detailDocumento.id_cliente)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Tipo de Documento</Typography>
                <Box>
                  <Chip 
                    label={detailDocumento.tipo_documento} 
                    size="small" 
                    color={getTipoDocumentoColor(detailDocumento.tipo_documento)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Fecha de Subida</Typography>
                <Typography variant="body2">
                  {detailDocumento.fecha_subida 
                    ? new Date(detailDocumento.fecha_subida).toLocaleString('es-GT') 
                    : 'Sin fecha'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Ruta de Almacenamiento</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {detailDocumento.ruta_storage}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Documento</DialogTitle>
        <Formik
          initialValues={{
            id_cliente: selectedDocumento?.id_cliente || '',
            tipo_documento: selectedDocumento?.tipo_documento || '',
            nombre_archivo: selectedDocumento?.nombre_archivo || '',
            ruta_storage: selectedDocumento?.ruta_storage || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido} - DPI: ${option.dpi}`}
                    value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                    onChange={(e, newValue) => {
                      setFieldValue('id_cliente', newValue ? newValue.id_cliente : '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        required
                        error={touched.id_cliente && Boolean(errors.id_cliente)}
                        helperText={touched.id_cliente && errors.id_cliente}
                      />
                    )}
                  />

                  <Autocomplete
                    options={tiposDocumento}
                    value={values.tipo_documento || null}
                    onChange={(e, newValue) => {
                      setFieldValue('tipo_documento', newValue || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Documento"
                        required
                        error={touched.tipo_documento && Boolean(errors.tipo_documento)}
                        helperText={touched.tipo_documento && errors.tipo_documento}
                      />
                    )}
                  />

                  <Field name="nombre_archivo">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre del Archivo"
                        fullWidth
                        required
                        error={touched.nombre_archivo && Boolean(errors.nombre_archivo)}
                        helperText={touched.nombre_archivo && errors.nombre_archivo}
                      />
                    )}
                  </Field>

                  <Field name="ruta_storage">
                    {({ field }) => (
                      <TextField
                        {...field}
                        label="Ruta de Almacenamiento"
                        fullWidth
                        required
                        error={touched.ruta_storage && Boolean(errors.ruta_storage)}
                        helperText={touched.ruta_storage && errors.ruta_storage}
                      />
                    )}
                  </Field>
                </Box>
              </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Actualizar'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, documento: null })}
        onConfirm={() => deleteConfirm.documento && handleDelete(deleteConfirm.documento.id_documento)}
        title="Eliminar Documento"
        message={`¿Estás seguro de que deseas eliminar el documento "${deleteConfirm.documento?.nombre_archivo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />

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

export default ClienteDocumentos;
