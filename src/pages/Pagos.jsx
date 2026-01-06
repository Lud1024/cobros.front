import { useState, useEffect, useCallback } from 'react';
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
  Autocomplete,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  Edit,
  Delete,
  Search,
  Receipt,
  Refresh,
  Visibility,
  Print,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import ResponsiveButton from '../components/ResponsiveButton';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { pagosService, prestamosService, clientesService } from '../services/api';
import { format } from 'date-fns';

const validationSchema = Yup.object({
  id_prestamo: Yup.number()
    .required('El préstamo es requerido'),
  fecha_pago: Yup.date()
    .required('La fecha de pago es requerida'),
  monto: Yup.number()
    .required('El monto es requerido')
    .positive('El monto debe ser positivo')
    .min(0.01, 'El monto debe ser mayor a 0'),
  metodo_pago: Yup.string()
    .required('El método de pago es requerido'),
});

const Pagos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pagos, setPagos] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPago, setDetailPago] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, pago: null });
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      id_prestamo: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      monto: '',
      metodo_pago: 'Efectivo',
      numero_recibo: '',
      observaciones: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Mapear monto a monto_recibido para el backend
        const payload = {
          ...values,
          monto_recibido: values.monto
        };
        delete payload.monto;

        if (editMode && selectedPago) {
          await pagosService.update(selectedPago.id_pago, payload);
          enqueueSnackbar('Pago actualizado exitosamente', { variant: 'success' });
        } else {
          await pagosService.create(payload);
          enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
        }
        handleClose();
        resetForm();
        fetchPagos();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.error || 'Error al guardar pago',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      const [pagosData, prestamosData, clientesData] = await Promise.all([
        pagosService.getAll(),
        prestamosService.getAll(),
        clientesService.getAll(),
      ]);
      setPagos(pagosData);
      setPrestamos(prestamosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar datos', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setSelectedPago(null);
    formik.resetForm();
    setOpen(true);
  };

  const handleEdit = (pago) => {
    setEditMode(true);
    setSelectedPago(pago);
    formik.setValues({
      id_prestamo: pago.id_prestamo || '',
      fecha_pago: pago.fecha_pago?.split('T')[0] || '',
      monto: pago.monto_recibido || pago.monto || '',
      metodo_pago: pago.metodo_pago || 'Efectivo',
      numero_recibo: pago.numero_recibo || pago.id_pago || '',
      observaciones: pago.observaciones || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedPago(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    try {
      await pagosService.delete(id);
      enqueueSnackbar('Pago eliminado exitosamente', { variant: 'success' });
      setDeleteConfirm({ open: false, pago: null });
      fetchPagos();
    } catch (error) {
      enqueueSnackbar('Error al eliminar pago', { variant: 'error' });
    }
  };

  const handleDeleteClick = (pago) => {
    setDeleteConfirm({ open: true, pago });
  };

  const getPrestamoInfo = (idPrestamo) => {
    const prestamo = prestamos.find((p) => p.id_prestamo === idPrestamo);
    if (!prestamo) return 'N/A';
    const cliente = clientes.find((c) => c.id_cliente === prestamo.id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido} - Préstamo #${idPrestamo}` : `Préstamo #${idPrestamo}`;
  };

  const formatCurrency = (value) => {
    if (!value) return 'Q 0.00';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value).replace('GTQ', 'Q');
  };

  const handlePrintReceipt = (pago) => {
    const prestamo = prestamos.find(p => p.id_prestamo === pago.id_prestamo);
    const cliente = clientes.find(c => c.id_cliente === prestamo?.id_cliente);
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo de Pago #${pago.numero_recibo || pago.id_pago}</title>
        <style>
          @page {
            size: 56mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 50mm;
            font-family: 'Arial Black', 'Arial Bold', Arial, sans-serif;
            font-size: 10pt;
            font-weight: 700;
            padding: 2mm 4mm 2mm 2mm;
            background: white;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .header {
            text-align: center;
            margin-bottom: 3mm;
            border-bottom: 2px solid #000;
            padding-bottom: 2mm;
          }
          .logo {
            font-weight: 900;
            font-size: 12pt;
            margin-bottom: 1mm;
            letter-spacing: 0.5px;
          }
          .empresa {
            font-size: 8pt;
            font-weight: 700;
            margin-bottom: 1mm;
          }
          .titulo {
            font-weight: 900;
            font-size: 11pt;
            margin: 2mm 0;
            text-align: center;
            letter-spacing: 0.5px;
          }
          .seccion {
            margin: 2mm 0;
            font-size: 9pt;
            font-weight: 700;
          }
          .linea {
            display: flex;
            justify-content: space-between;
            margin: 1mm 0;
            line-height: 1.4;
          }
          .linea .label {
            font-weight: 900;
          }
          .linea .value {
            text-align: right;
            font-weight: 700;
            padding-right: 2mm;
          }
          .monto {
            font-size: 14pt;
            font-weight: 900;
            text-align: center;
            margin: 3mm 0;
            padding: 2mm;
            border: 3px solid #000;
            letter-spacing: 1px;
          }
          .separador {
            border-top: 2px dashed #000;
            margin: 2mm 0;
          }
          .footer {
            text-align: center;
            font-size: 7pt;
            font-weight: 700;
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 2px dashed #000;
          }
          .firma {
            margin-top: 8mm;
            text-align: center;
            font-size: 8pt;
            font-weight: 700;
          }
          .firma-linea {
            border-top: 2px solid #000;
            width: 80%;
            margin: 0 auto 1mm auto;
          }
          @media print {
            body {
              width: 50mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CRÉDITOS LA UNIÓN</div>
          <!--<div class="empresa">Sistema de Gestión de Préstamos</div>-->
          <div class="empresa">Tel: 1234-5678</div>
        </div>

        <div class="titulo">RECIBO DE PAGO</div>

        <div class="seccion">
          <div class="linea">
            <span class="label">Recibo No:</span>
            <span class="value">${pago.numero_recibo || pago.id_pago}</span>
          </div>
          <div class="linea">
            <span class="label">Fecha:</span>
            <span class="value">${pago.fecha_pago ? format(new Date(pago.fecha_pago), 'dd/MM/yyyy HH:mm') : 'N/A'}</span>
          </div>
        </div>

        <div class="separador"></div>

        <div class="seccion">
          <div style="margin: 1mm 0; line-height: 1.4;">
            <span class="label" style="font-weight: 900;">Cliente: </span><span style="font-weight: 700;">${cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A'}</span>
          </div>
          <div class="linea">
            <span class="label">Préstamo No:</span>
            <span class="value">${pago.id_prestamo}</span>
          </div>
        </div>

        <div class="separador"></div>

        <div class="monto">
          ${formatCurrency(pago.monto_recibido)}
        </div>

        <div class="seccion">
          <div style="margin: 1mm 0;">
            <div style="font-weight: 900; line-height: 1.4;">Método de Pago:</div>
            <div style="font-weight: 700; line-height: 1.4;">${pago.metodo_pago}</div>
          </div>
          ${pago.observaciones ? `
          <div class="linea" style="margin-top: 2mm;">
            <span class="label">Observaciones:</span>
          </div>
          <div style="font-size: 7pt; margin-top: 1mm; font-weight: 600; padding-right: 2mm;">${pago.observaciones}</div>
          ` : ''}
        </div>

        <div class="firma">
          <div class="firma-linea"></div>
          <div>Firma del Cliente</div>
        </div>

        <div class="footer">
          <div>¡Gracias por su pago!</div>
          <div style="margin-top: 1mm;">Este documento es válido como comprobante de pago</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      enqueueSnackbar('No se pudo abrir la ventana de impresión', { variant: 'error' });
    }
  };

  const filteredPagos = pagos.filter((pago) => {
    const prestamoInfo = getPrestamoInfo(pago.id_prestamo);
    return (
      prestamoInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.numero_recibo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Box>
      <PageHeader
        title="Gestión de Pagos"
        subtitle={`${filteredPagos.length} pago${filteredPagos.length !== 1 ? 's' : ''} encontrado${filteredPagos.length !== 1 ? 's' : ''}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar lista">
              <IconButton onClick={fetchPagos} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <ResponsiveButton
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/app/pagos/nuevo')}
            >
              Registrar Pago
            </ResponsiveButton>
          </Box>
        }
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            placeholder="Buscar por cliente, préstamo o número de recibo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
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
                  <Skeleton width="60%" height={24} />
                  <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                  <Skeleton width="30%" height={24} />
                </CardContent>
              </Card>
            ))
          ) : filteredPagos.length === 0 ? (
            <EmptyState
              title="No se encontraron pagos"
              description={searchTerm ? 'Intenta con otros términos de búsqueda' : 'Registra tu primer pago'}
              actionLabel="Registrar Pago"
              onAction={() => navigate('/app/pagos/nuevo')}
            />
          ) : (
            filteredPagos.map((pago) => (
              <Card key={pago.id_pago} sx={{ '&:hover': { boxShadow: 3 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {getPrestamoInfo(pago.id_prestamo)}
                      </Typography>
                      <Typography variant="h6" color="success.main" fontWeight={600}>
                        {formatCurrency(pago.monto_recibido)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {pago.fecha_pago ? format(new Date(pago.fecha_pago), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={pago.metodo_pago} size="small" variant="outlined" />
                        {pago.numero_recibo && (
                          <Chip 
                            label={`#${pago.numero_recibo}`} 
                            size="small" 
                            variant="outlined"
                            icon={<Receipt sx={{ fontSize: 14 }} />}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handlePrintReceipt(pago)}
                        title="Imprimir recibo"
                      >
                        <Print fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => { setDetailPago(pago); setDetailOpen(true); }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="info" onClick={() => handleEdit(pago)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(pago)}>
                        <Delete fontSize="small" />
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
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Préstamo/Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Método</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Recibo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredPagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron pagos</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPagos.map((pago) => (
                  <TableRow key={pago.id_pago} hover>
                    <TableCell>{pago.id_pago}</TableCell>
                    <TableCell>{getPrestamoInfo(pago.id_prestamo)}</TableCell>
                    <TableCell>
                      {pago.fecha_pago
                        ? format(new Date(pago.fecha_pago), 'dd/MM/yyyy HH:mm')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        {formatCurrency(pago.monto_recibido)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={pago.metodo_pago} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Receipt fontSize="small" color="action" />
                        <Typography variant="caption">{pago.numero_recibo || pago.id_pago}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Imprimir recibo">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePrintReceipt(pago)}
                        >
                          <Print fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => { setDetailPago(pago); setDetailOpen(true); }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleEdit(pago)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(pago)}
                        >
                          <Delete fontSize="small" />
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

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailPago(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Detalles del Pago</DialogTitle>
        <DialogContent dividers>
          {detailPago ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Préstamo / Cliente</Typography>
                <Typography variant="body1" fontWeight={500}>{getPrestamoInfo(detailPago.id_prestamo)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Fecha</Typography>
                <Typography variant="body2">{detailPago.fecha_pago ? format(new Date(detailPago.fecha_pago), 'dd/MM/yyyy HH:mm') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Monto</Typography>
                <Typography variant="h6" color="success.main">{formatCurrency(detailPago.monto_recibido)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Método</Typography>
                <Chip label={detailPago.metodo_pago} size="small" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Recibo</Typography>
                <Typography variant="body2">{detailPago.numero_recibo || detailPago.id_pago}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Observaciones</Typography>
                <Typography variant="body2">{detailPago.observaciones || 'Sin observaciones'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailPago(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Pago' : 'Registrar Pago'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={prestamos}
                  getOptionLabel={(option) => {
                    const cliente = clientes.find((c) => c.id_cliente === option.id_cliente);
                    return cliente
                      ? `${cliente.nombre} ${cliente.apellido} - Préstamo #${option.id_prestamo} (${formatCurrency(option.monto_prestamo)})`
                      : `Préstamo #${option.id_prestamo}`;
                  }}
                  value={prestamos.find((p) => p.id_prestamo === formik.values.id_prestamo) || null}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('id_prestamo', newValue?.id_prestamo || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      margin="dense"
                      label="Préstamo"
                      error={formik.touched.id_prestamo && Boolean(formik.errors.id_prestamo)}
                      helperText={formik.touched.id_prestamo && formik.errors.id_prestamo}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="fecha_pago"
                  name="fecha_pago"
                  label="Fecha de Pago"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.fecha_pago}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fecha_pago && Boolean(formik.errors.fecha_pago)}
                  helperText={formik.touched.fecha_pago && formik.errors.fecha_pago}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="monto"
                  name="monto"
                  label="Monto"
                  type="number"
                  InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                  value={formik.values.monto}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.monto && Boolean(formik.errors.monto)}
                  helperText={formik.touched.monto && formik.errors.monto}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  id="metodo_pago"
                  name="metodo_pago"
                  label="Método de Pago"
                  SelectProps={{ native: true }}
                  value={formik.values.metodo_pago}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.metodo_pago && Boolean(formik.errors.metodo_pago)}
                  helperText={formik.touched.metodo_pago && formik.errors.metodo_pago}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="numero_recibo"
                  name="numero_recibo"
                  label="Número de Recibo"
                  value={formik.values.numero_recibo || (editMode && selectedPago ? selectedPago.id_pago : 'Se generará automáticamente')}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                  helperText="Se asigna automáticamente al crear el pago"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  id="observaciones"
                  name="observaciones"
                  label="Observaciones"
                  multiline
                  rows={2}
                  value={formik.values.observaciones}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              {formik.isSubmitting ? 'Guardando...' : (editMode ? 'Actualizar' : 'Registrar')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, pago: null })}
        onConfirm={() => deleteConfirm.pago && handleDelete(deleteConfirm.pago.id_pago)}
        title="Eliminar Pago"
        message={`¿Estás seguro de que deseas eliminar el pago #${deleteConfirm.pago?.id_pago} por ${deleteConfirm.pago ? formatCurrency(deleteConfirm.pago.monto_recibido) : ''}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </Box>
  );
};

export default Pagos;
