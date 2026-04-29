import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ContactPhone,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person,
  Refresh,
  Search as SearchIcon,
  Visibility,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import ResponsiveButton from '../components/ResponsiveButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { clienteReferenciasService, clientesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const parentescos = [
  'Conyuge',
  'Padre/Madre',
  'Hermano/a',
  'Hijo/a',
  'Familiar',
  'Amigo/a',
  'Vecino/a',
  'Companero/a de trabajo',
  'Otro',
];

const phoneRegex = /^[0-9+\-\s]{8,20}$/;

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  nombre_completo: Yup.string().trim().required('El nombre es requerido').max(150, 'Maximo 150 caracteres'),
  parentesco: Yup.string().trim().required('El parentesco es requerido').max(60, 'Maximo 60 caracteres'),
  telefono: Yup.string()
    .trim()
    .matches(phoneRegex, 'Telefono invalido')
    .required('El telefono es requerido'),
  dpi: Yup.string()
    .trim()
    .matches(/^$|^\d{13}$/, 'El DPI debe tener 13 digitos')
    .nullable(),
  direccion: Yup.string().trim().max(255, 'Maximo 255 caracteres').nullable(),
  lugar_trabajo: Yup.string().trim().max(150, 'Maximo 150 caracteres').nullable(),
  telefono_trabajo: Yup.string()
    .trim()
    .matches(/^$|^[0-9+\-\s]{8,20}$/, 'Telefono de trabajo invalido')
    .nullable(),
  observaciones: Yup.string().trim().nullable(),
  estado: Yup.string().oneOf(['A', 'I']).required('El estado es requerido'),
});

const initialValues = {
  id_cliente: '',
  nombre_completo: '',
  parentesco: '',
  telefono: '',
  dpi: '',
  direccion: '',
  lugar_trabajo: '',
  telefono_trabajo: '',
  observaciones: '',
  estado: 'A',
};

function ClienteReferencias() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const { hasAnyPermission } = useAuth();
  const canManage = hasAnyPermission(['clientes', 'editar_clientes']);
  const canDelete = hasAnyPermission(['clientes', 'eliminar_clientes']);

  const [referencias, setReferencias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReferencia, setSelectedReferencia] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailReferencia, setDetailReferencia] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, referencia: null });

  const loadData = async () => {
    try {
      setLoading(true);
      const [referenciasData, clientesData] = await Promise.all([
        clienteReferenciasService.getAll(),
        clientesService.getAll(),
      ]);
      setReferencias(referenciasData);
      setClientes(clientesData);
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Error al cargar referencias', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReferencias = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return referencias.filter((referencia) => {
      const cliente = `${referencia.cliente_nombre || ''} ${referencia.cliente_apellido || ''}`.toLowerCase();
      return (
        referencia.nombre_completo?.toLowerCase().includes(term) ||
        referencia.parentesco?.toLowerCase().includes(term) ||
        referencia.telefono?.toLowerCase().includes(term) ||
        referencia.dpi?.toLowerCase().includes(term) ||
        cliente.includes(term)
      );
    });
  }, [referencias, searchTerm]);

  const getClienteLabel = (referencia) => {
    if (referencia?.cliente_nombre || referencia?.cliente_apellido) {
      return `${referencia.cliente_nombre || ''} ${referencia.cliente_apellido || ''}`.trim();
    }
    const cliente = clientes.find((c) => c.id_cliente === referencia?.id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
  };

  const getInitialValues = () => {
    if (!selectedReferencia) return initialValues;
    return {
      id_cliente: selectedReferencia.id_cliente || '',
      nombre_completo: selectedReferencia.nombre_completo || '',
      parentesco: selectedReferencia.parentesco || '',
      telefono: selectedReferencia.telefono || '',
      dpi: selectedReferencia.dpi || '',
      direccion: selectedReferencia.direccion || '',
      lugar_trabajo: selectedReferencia.lugar_trabajo || '',
      telefono_trabajo: selectedReferencia.telefono_trabajo || '',
      observaciones: selectedReferencia.observaciones || '',
      estado: selectedReferencia.estado || 'A',
    };
  };

  const handleOpenDialog = (referencia = null) => {
    setSelectedReferencia(referencia);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReferencia(null);
  };

  const cleanPayload = (values) => ({
    ...values,
    nombre_completo: values.nombre_completo.trim(),
    parentesco: values.parentesco.trim(),
    telefono: values.telefono.trim(),
    dpi: values.dpi?.trim() || null,
    direccion: values.direccion?.trim() || null,
    lugar_trabajo: values.lugar_trabajo?.trim() || null,
    telefono_trabajo: values.telefono_trabajo?.trim() || null,
    observaciones: values.observaciones?.trim() || null,
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = cleanPayload(values);
      if (selectedReferencia) {
        await clienteReferenciasService.update(selectedReferencia.id_referencia, payload);
        enqueueSnackbar('Referencia actualizada exitosamente', { variant: 'success' });
      } else {
        await clienteReferenciasService.create(payload);
        enqueueSnackbar('Referencia creada exitosamente', { variant: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Error al guardar referencia', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clienteReferenciasService.delete(deleteConfirm.referencia.id_referencia);
      enqueueSnackbar('Referencia eliminada exitosamente', { variant: 'success' });
      setDeleteConfirm({ open: false, referencia: null });
      loadData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Error al eliminar referencia', { variant: 'error' });
    }
  };

  const renderActions = (referencia) => (
    <>
      <Tooltip title="Ver detalles">
        <IconButton
          size="small"
          color="info"
          onClick={() => {
            setDetailReferencia(referencia);
            setDetailOpen(true);
          }}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
      {canManage && (
        <Tooltip title="Editar">
          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(referencia)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {canDelete && (
        <Tooltip title="Eliminar">
          <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, referencia })}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  return (
    <Box>
      <PageHeader
        title="Referencias de Clientes"
        subtitle={`${filteredReferencias.length} referencia${filteredReferencias.length !== 1 ? 's' : ''}`}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar">
              <IconButton onClick={loadData} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {canManage && (
              <ResponsiveButton variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Nueva Referencia
              </ResponsiveButton>
            )}
          </Box>
        }
      />

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TextField
            placeholder="Buscar por cliente, referencia, parentesco o telefono..."
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
            }}
          />
        </CardContent>
      </Card>

      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent>
                  <Skeleton width="60%" />
                  <Skeleton width="80%" />
                </CardContent>
              </Card>
            ))
          ) : filteredReferencias.length === 0 ? (
            <EmptyState
              title="No se encontraron referencias"
              description={searchTerm ? 'Intenta con otros terminos de busqueda' : 'Agrega la primera referencia para comenzar'}
              actionLabel={canManage ? 'Nueva Referencia' : undefined}
              onAction={canManage ? () => handleOpenDialog() : undefined}
            />
          ) : (
            filteredReferencias.map((referencia) => (
              <Card key={referencia.id_referencia}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {referencia.nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {getClienteLabel(referencia)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                        <ContactPhone fontSize="small" sx={{ fontSize: 16 }} color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {referencia.telefono}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip label={referencia.parentesco} size="small" color="primary" variant="outlined" />
                        <Chip label={referencia.estado === 'A' ? 'Activa' : 'Inactiva'} size="small" color={referencia.estado === 'A' ? 'success' : 'default'} variant="outlined" />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>{renderActions(referencia)}</Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Referencia</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Parentesco</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Telefono</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                  </TableRow>
                ))
              ) : filteredReferencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron referencias</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReferencias.map((referencia) => (
                  <TableRow key={referencia.id_referencia} hover>
                    <TableCell>{referencia.id_referencia}</TableCell>
                    <TableCell>{getClienteLabel(referencia)}</TableCell>
                    <TableCell>{referencia.nombre_completo}</TableCell>
                    <TableCell>{referencia.parentesco}</TableCell>
                    <TableCell>{referencia.telefono}</TableCell>
                    <TableCell>
                      <Chip
                        label={referencia.estado === 'A' ? 'Activa' : 'Inactiva'}
                        size="small"
                        color={referencia.estado === 'A' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">{renderActions(referencia)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle de Referencia</DialogTitle>
        <DialogContent dividers>
          {detailReferencia ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Referencia</Typography>
                <Typography variant="body1" fontWeight={600}>{detailReferencia.nombre_completo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Cliente</Typography>
                <Typography variant="body2">{getClienteLabel(detailReferencia)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Parentesco</Typography>
                <Typography variant="body2">{detailReferencia.parentesco}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Telefono</Typography>
                <Typography variant="body2">{detailReferencia.telefono}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">DPI</Typography>
                <Typography variant="body2">{detailReferencia.dpi || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Estado</Typography>
                <Typography variant="body2">{detailReferencia.estado === 'A' ? 'Activa' : 'Inactiva'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Direccion</Typography>
                <Typography variant="body2">{detailReferencia.direccion || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Lugar de Trabajo</Typography>
                <Typography variant="body2">{detailReferencia.lugar_trabajo || '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Telefono Trabajo</Typography>
                <Typography variant="body2">{detailReferencia.telefono_trabajo || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Observaciones</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detailReferencia.observaciones || '-'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography>No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedReferencia ? 'Editar Referencia' : 'Nueva Referencia'}</DialogTitle>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={clientes}
                      getOptionLabel={(option) => `${option.nombre} ${option.apellido} - DPI: ${option.dpi}`}
                      value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                      onChange={(_, newValue) => setFieldValue('id_cliente', newValue ? newValue.id_cliente : '')}
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nombre_completo">
                      {({ field }) => (
                        <TextField {...field} label="Nombre completo" fullWidth required error={touched.nombre_completo && Boolean(errors.nombre_completo)} helperText={touched.nombre_completo && errors.nombre_completo} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      freeSolo
                      options={parentescos}
                      value={values.parentesco || ''}
                      onChange={(_, value) => setFieldValue('parentesco', value || '')}
                      onInputChange={(_, value) => setFieldValue('parentesco', value || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Parentesco" required error={touched.parentesco && Boolean(errors.parentesco)} helperText={touched.parentesco && errors.parentesco} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="telefono">
                      {({ field }) => (
                        <TextField {...field} label="Telefono" fullWidth required inputProps={{ inputMode: 'tel' }} error={touched.telefono && Boolean(errors.telefono)} helperText={touched.telefono && errors.telefono} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="dpi">
                      {({ field }) => (
                        <TextField {...field} label="DPI (opcional)" fullWidth inputProps={{ inputMode: 'numeric', maxLength: 13 }} error={touched.dpi && Boolean(errors.dpi)} helperText={touched.dpi && errors.dpi} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="direccion">
                      {({ field }) => (
                        <TextField {...field} label="Direccion" fullWidth error={touched.direccion && Boolean(errors.direccion)} helperText={touched.direccion && errors.direccion} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="lugar_trabajo">
                      {({ field }) => (
                        <TextField {...field} label="Lugar de trabajo" fullWidth error={touched.lugar_trabajo && Boolean(errors.lugar_trabajo)} helperText={touched.lugar_trabajo && errors.lugar_trabajo} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="telefono_trabajo">
                      {({ field }) => (
                        <TextField {...field} label="Telefono de trabajo" fullWidth inputProps={{ inputMode: 'tel' }} error={touched.telefono_trabajo && Boolean(errors.telefono_trabajo)} helperText={touched.telefono_trabajo && errors.telefono_trabajo} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="estado">
                      {({ field }) => (
                        <TextField {...field} select label="Estado" fullWidth required error={touched.estado && Boolean(errors.estado)} helperText={touched.estado && errors.estado}>
                          <MenuItem value="A">Activa</MenuItem>
                          <MenuItem value="I">Inactiva</MenuItem>
                        </TextField>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="observaciones">
                      {({ field }) => (
                        <TextField {...field} label="Observaciones" fullWidth multiline rows={3} error={touched.observaciones && Boolean(errors.observaciones)} helperText={touched.observaciones && errors.observaciones} />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : selectedReferencia ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, referencia: null })}
        onConfirm={handleDelete}
        title="Eliminar Referencia"
        message={`Seguro que deseas eliminar la referencia "${deleteConfirm.referencia?.nombre_completo || ''}"?`}
        confirmText="Eliminar"
        severity="error"
      />
    </Box>
  );
}

export default ClienteReferencias;
