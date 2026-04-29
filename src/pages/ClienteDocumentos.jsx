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
  CircularProgress,
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
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';

const tiposDocumento = [
  'DPI',
  'Contrato de Prestamo',
  'Recibo de Pago',
  'Comprobante de Ingresos',
  'Comprobante de Domicilio',
  'Garantia',
  'PDF',
  'EXCEL',
  'OTRO',
];

const APPS_SCRIPT_GET_PDF_URL =
  'https://script.google.com/macros/s/AKfycbzuHkd29dqng8SUhn0GCez25171K4yVgcb7mb5W-vVztxOOuGFDtVFbs2HXZZSUgNcQ/exec';

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  tipo_documento: Yup.string().required('El tipo de archivo es requerido'),
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
  const { hasPermission } = useAuth();
  const canManage = hasPermission('gestionar_documentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewingDoc, setViewingDoc] = useState(false);

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
      loadData();
    } catch (error) {
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      showSnackbar(
        apiMessage || 'Error al guardar documento',
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
      'DPI': 'info',
      'Contrato de Prestamo': 'primary',
      'Recibo de Pago': 'success',
      'Comprobante de Ingresos': 'warning',
      'Comprobante de Domicilio': 'warning',
      'Garantia': 'secondary',
      'PDF': 'primary',
      'EXCEL': 'success',
      'OTRO': 'default',
    };
    return colores[tipo] || 'default';
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const buildDocumentoUrl = (rutaStorage) => {
    if (!rutaStorage) return '';

    // Si ya es una URL completa, usarla directamente
    if (/^https?:\/\//i.test(rutaStorage)) return rutaStorage;

    // Caso típico (nuevo flujo): ruta_storage = fileId
    return `${APPS_SCRIPT_GET_PDF_URL}?fileId=${encodeURIComponent(rutaStorage)}`;
  };

  const isAppsScriptUrl = (url) => {
    if (!url) return false;
    return url.startsWith(APPS_SCRIPT_GET_PDF_URL) || url.includes('script.google.com/macros/s/');
  };

  const openPdfFromAppsScript = async (rutaStorage) => {
    const url = buildDocumentoUrl(rutaStorage);

    // Para URLs externas que no son Apps Script, abrir normal.
    if (!isAppsScriptUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Abrir popup inmediatamente para evitar bloqueo por async.
    // Importante: NO usar `noreferrer` aquí, porque puede dar un origen opaco y el `blob:` no carga (queda en blanco).
    const popup = window.open('', '_blank');
    if (!popup) {
      throw new Error('Permite ventanas emergentes para ver el documento');
    }

    try {
      popup.document.title = 'Cargando documento…';
      popup.document.body.innerHTML = `
        <style>
          :root { color-scheme: light dark; }
          body {
            margin: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            background: Canvas;
            color: CanvasText;
          }
          .wrap {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
          }
          .card {
            width: min(520px, 100%);
            border: 1px solid color-mix(in srgb, CanvasText 18%, transparent);
            border-radius: 12px;
            padding: 18px 18px 16px;
            background: color-mix(in srgb, Canvas 92%, CanvasText 8%);
          }
          .title {
            font-size: 16px;
            font-weight: 650;
            margin: 0 0 8px;
          }
          .sub {
            font-size: 13px;
            opacity: .8;
            margin: 0 0 14px;
            line-height: 1.35;
          }
          progress {
            width: 100%;
            height: 10px;
            border-radius: 999px;
            overflow: hidden;
          }
          progress::-webkit-progress-bar {
            background: color-mix(in srgb, CanvasText 10%, transparent);
            border-radius: 999px;
          }
          progress::-webkit-progress-value {
            border-radius: 999px;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin-top: 12px;
            font-size: 12px;
            opacity: .7;
          }
          .dots::after {
            content: '';
            display: inline-block;
            width: 14px;
            text-align: left;
            animation: dots 1.2s steps(4, end) infinite;
          }
          @keyframes dots {
            0% { content: ''; }
            25% { content: '.'; }
            50% { content: '..'; }
            75% { content: '...'; }
            100% { content: ''; }
          }
        </style>
          <div class="wrap">
          <div class="card" role="status" aria-live="polite">
            <p class="title">Abriendo documento</p>
            <p class="sub">Estamos cargando el PDF. Esto puede tardar unos segundos<span class="dots"></span></p>
            <progress></progress>
            <div class="meta">
              <span id="doc-stage">Preparando PDF</span>
            </div>
          </div>
        </div>
      `;
    } catch {
      // ignore
    }

    let json;
    try {
      const response = await fetch(url, { method: 'GET' });
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        json = await response.json();
      } else {
        const text = await response.text();
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error(text || `Error HTTP ${response.status}`);
        }
      }

      if (!response.ok) {
        throw new Error(json?.message || json?.error || `Error HTTP ${response.status}`);
      }

      if (json?.status !== 'success') {
        throw new Error(json?.message || json?.error || 'No se pudo obtener el documento');
      }

      const mimeType = json?.mimeType || 'application/pdf';
      const fileName = json?.fileName || 'documento.pdf';
      let base64 = json?.fileData || '';
      if (!base64) throw new Error('Respuesta inválida: falta fileData');

      // Si viene con encabezado data:...;base64,
      base64 = String(base64).replace(/^data:.*;base64,/, '');

      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

      const blob = new Blob([bytes], { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);

      const formatBytes = (bytesValue) => {
        const n = Number(bytesValue);
        if (!Number.isFinite(n) || n < 0) return '—';
        if (n < 1024) return `${n} B`;
        const units = ['KB', 'MB', 'GB'];
        let value = n / 1024;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
          value /= 1024;
          unitIndex++;
        }
        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
      };

      try {
        const sizeEl = popup.document.getElementById('doc-size');
        if (sizeEl) sizeEl.textContent = formatBytes(blob.size);
        const stageEl = popup.document.getElementById('doc-stage');
        if (stageEl) stageEl.textContent = 'Abriendo PDF…';
      } catch {
        // ignore
      }

      try {
        popup.document.title = fileName;
      } catch {
        // ignore
      }
      popup.location.href = objectUrl;

      // Revoke después de un rato para liberar memoria
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (err) {
      popup.close();
      throw err;
    }
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
                          label={documento.fecha_subida ? formatDate(documento.fecha_subida) : 'Sin fecha'} 
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
                      {canManage && (
                        <IconButton size="small" color="info" onClick={() => handleOpenDialog(documento)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canManage && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(documento)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
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
                        ? formatDate(documento.fecha_subida)
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
                      {canManage && (
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenDialog(documento)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canManage && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(documento)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
                    ? formatDate(detailDocumento.fecha_subida, true) 
                    : 'Sin fecha'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Documento</Typography>
                {detailDocumento.ruta_storage ? (
                  <Button
                    variant="outlined"
                    startIcon={<Description />}
                    disabled={viewingDoc}
                    onClick={async () => {
                      try {
                        setViewingDoc(true);
                        await openPdfFromAppsScript(detailDocumento.ruta_storage);
                      } catch (err) {
                        showSnackbar(err?.message || 'Error al abrir documento', 'error');
                      } finally {
                        setViewingDoc(false);
                      }
                    }}
                  >
                    {viewingDoc ? (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        Abriendo… <CircularProgress size={16} />
                      </Box>
                    ) : (
                      'Ver documento'
                    )}
                  </Button>
                ) : (
                  <Alert severity="info">Este registro no tiene archivo asociado.</Alert>
                )}
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
                        label="Tipo de Archivo"
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
