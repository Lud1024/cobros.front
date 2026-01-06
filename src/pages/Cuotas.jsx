import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
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
  LinearProgress,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  Refresh,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { cuotasService, prestamosService, clientesService, getErrorMessage } from '../services/api';
import { format } from 'date-fns';
import PageHeader from '../components/PageHeader';

const Cuotas = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cuotas, setCuotas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCuota, setDetailCuota] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchCuotas = async () => {
    try {
      setLoading(true);
      const [cuotasData, prestamosData, clientesData] = await Promise.all([
        cuotasService.getAll(),
        prestamosService.getAll(),
        clientesService.getAll(),
      ]);
      setCuotas(cuotasData);
      setPrestamos(prestamosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Error al cargar cuotas', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCuotas();
  }, []);

  useEffect(() => {
    if (selectedPrestamo) {
      fetchCuotasByPrestamo(selectedPrestamo.id_prestamo);
    }
  }, [selectedPrestamo]);

  const fetchCuotasByPrestamo = async (idPrestamo) => {
    try {
      setLoading(true);
      const data = await cuotasService.getByPrestamo(idPrestamo);
      setCuotas(data);
    } catch (error) {
      enqueueSnackbar('Error al cargar cuotas del préstamo', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getClienteName = (idPrestamo) => {
    const prestamo = prestamos.find((p) => p.id_prestamo === idPrestamo);
    if (!prestamo) return 'N/A';
    const cliente = clientes.find((c) => c.id_cliente === prestamo.id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Pendiente': 'warning',
      'Pagada': 'success',
      'Vencida': 'error',
      'Parcial': 'info',
    };
    return colores[estado] || 'default';
  };

  const formatCurrency = (value) => {
    if (!value) return 'Q 0.00';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(value).replace('GTQ', 'Q');
  };

  const calcularProgreso = (montoPagado, montoTotal) => {
    const porcentaje = (montoPagado / montoTotal) * 100;
    return Math.min(porcentaje, 100);
  };

  const filteredCuotas = cuotas.filter((cuota) => {
    const clienteNombre = getClienteName(cuota.id_prestamo);
    return (
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cuota.numero_cuota?.toString().includes(searchTerm)
    );
  });

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Gestión de Cuotas
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Autocomplete
                options={prestamos}
                getOptionLabel={(option) => {
                  const cliente = clientes.find((c) => c.id_cliente === option.id_cliente);
                  return cliente
                    ? `${cliente.nombre} ${cliente.apellido} - Préstamo #${option.id_prestamo}`
                    : `Préstamo #${option.id_prestamo}`;
                }}
                value={selectedPrestamo}
                onChange={(_, newValue) => {
                  setSelectedPrestamo(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filtrar por Préstamo"
                    placeholder="Selecciona un préstamo..."
                  />
                )}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Buscar por cliente o número de cuota..."
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
        </Grid>
      </Grid>

      {isMobile ? (
        // Vista de tarjetas para móvil
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Card><CardContent><Typography align="center">Cargando...</Typography></CardContent></Card>
          ) : filteredCuotas.length === 0 ? (
            <Card><CardContent><Typography align="center">No se encontraron cuotas</Typography></CardContent></Card>
          ) : (
            filteredCuotas.map((cuota) => (
              <Card key={cuota.id_cuota} elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      Cuota #{cuota.numero_cuota}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Préstamo #{cuota.id_prestamo} | {getClienteName(cuota.id_prestamo)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {cuota.fecha_vencimiento ? format(new Date(cuota.fecha_vencimiento), 'dd/MM/yyyy') : 'N/A'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calcularProgreso(cuota.monto_pagado || 0, cuota.monto_cuota)}
                          sx={{ height: 6, borderRadius: 3, flexGrow: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {calcularProgreso(cuota.monto_pagado || 0, cuota.monto_cuota).toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={formatCurrency(cuota.monto_cuota)} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={cuota.estado || 'Pendiente'} 
                        size="small" 
                        color={getEstadoColor(cuota.estado)}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => { setDetailCuota(cuota); setDetailOpen(true); }}
                    >
                      <VisibilityIcon fontSize="small" />
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cuota #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Préstamo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fecha Vencimiento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Monto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Pagado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Progreso</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredCuotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron cuotas
                  </TableCell>
                </TableRow>
              ) : (
                filteredCuotas.map((cuota) => (
                  <TableRow key={cuota.id_cuota} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {cuota.numero_cuota}
                      </Typography>
                    </TableCell>
                    <TableCell>#{cuota.id_prestamo}</TableCell>
                    <TableCell>{getClienteName(cuota.id_prestamo)}</TableCell>
                    <TableCell>
                      {cuota.fecha_vencimiento
                        ? format(new Date(cuota.fecha_vencimiento), 'dd/MM/yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(cuota.monto_cuota)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(cuota.monto_pagado || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={calcularProgreso(cuota.monto_pagado || 0, cuota.monto_cuota)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {calcularProgreso(cuota.monto_pagado || 0, cuota.monto_cuota).toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cuota.estado || 'Pendiente'}
                        color={getEstadoColor(cuota.estado)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => { setDetailOpen(false); setDetailCuota(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Detalles de la Cuota</DialogTitle>
        <DialogContent dividers>
          {detailCuota ? (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Cuota</Typography>
                <Typography variant="body2">#{detailCuota.numero_cuota}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Préstamo</Typography>
                <Typography variant="body2">#{detailCuota.id_prestamo}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Fecha Vencimiento</Typography>
                <Typography variant="body2">{detailCuota.fecha_vencimiento ? format(new Date(detailCuota.fecha_vencimiento), 'dd/MM/yyyy') : 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Monto</Typography>
                <Typography variant="body2">{formatCurrency(detailCuota.monto_cuota)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Pagado</Typography>
                <Typography variant="body2">{formatCurrency(detailCuota.monto_pagado || 0)}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Estado</Typography>
                <Typography variant="body2">{detailCuota.estado || 'Pendiente'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2">No hay detalles disponibles</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDetailOpen(false); setDetailCuota(null); }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cuotas;
