import React, { useState, useEffect, useCallback, cloneElement } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  People,
  AccountBalance,
  Payment,
  TrendingUp,
  Download,
  PictureAsPdf,
  Refresh,
  TableChart,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useSnackbar } from 'notistack';
import { clientesService, prestamosService, pagosService, getErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import PageHeader from '../components/PageHeader';
import ResponsiveButton from '../components/ResponsiveButton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const COLORS = ['#00C853', '#66BB6A', '#C8E6A0', '#81C784', '#4CAF50', '#A5D6A7'];

// Componente StatCard mejorado
const StatCard = ({ title, value, icon, color, loading, trend, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      elevation={2}
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              color="text.secondary" 
              gutterBottom 
              variant="body2"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} />
            ) : (
              <Typography 
                variant="h4" 
                component="div" 
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendingUp 
                  sx={{ 
                    fontSize: 16, 
                    color: trend >= 0 ? 'success.main' : 'error.main',
                    mr: 0.5,
                    transform: trend < 0 ? 'rotate(180deg)' : 'none',
                  }} 
                />
                <Typography 
                  variant="caption" 
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                >
                  {Math.abs(trend)}% vs mes anterior
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              borderRadius: 2,
              bgcolor: `${color}.light`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              ml: 1,
            }}
          >
            {cloneElement(icon, { 
              sx: { color: `${color}.main`, fontSize: { xs: 24, sm: 30 } } 
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPrestamos: 0,
    totalMontoPrestado: 0,
    totalPagos: 0,
  });
  const [prestamosData, setPrestamosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const [clientes, prestamos, pagos] = await Promise.all([
        clientesService.getAll(),
        prestamosService.getAll(),
        pagosService.getAll(),
      ]);

      const totalMonto = prestamos.reduce((sum, p) => sum + parseFloat(p.monto || 0), 0);
      const totalPagosSum = pagos.reduce((sum, p) => sum + parseFloat(p.monto_recibido || 0), 0);

      setStats({
        totalClientes: clientes.length,
        totalPrestamos: prestamos.length,
        totalMontoPrestado: totalMonto,
        totalPagos: totalPagosSum,
      });

      // Agrupar préstamos por estado
      const prestamosPorEstado = prestamos.reduce((acc, prestamo) => {
        const estado = prestamo.estado || 'Pendiente';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      setPrestamosData(
        Object.entries(prestamosPorEstado).map(([name, value]) => ({
          name,
          value,
        }))
      );
      
      if (showRefreshing) {
        enqueueSnackbar('Datos actualizados', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);



  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text('Reporte del Dashboard', 14, 20);
      
      // Fecha
      doc.setFontSize(10);
      doc.text(`Generado: ${formatDate(new Date(), true)}`, 14, 28);
      
      // Resumen de estadísticas
      doc.setFontSize(14);
      doc.text('Resumen de Estadísticas', 14, 40);
      
      doc.autoTable({
        startY: 45,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Clientes', stats.totalClientes],
          ['Total de Préstamos', stats.totalPrestamos],
          ['Monto Total Prestado', formatCurrency(stats.totalMontoPrestado)],
          ['Total de Pagos Recibidos', formatCurrency(stats.totalPagos)],
        ],
      });

      // Préstamos por estado
      doc.setFontSize(14);
      doc.text('Préstamos por Estado', 14, doc.lastAutoTable.finalY + 15);
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Estado', 'Cantidad']],
        body: prestamosData.map(item => [item.name, item.value]),
      });

      doc.save('dashboard-report.pdf');
      enqueueSnackbar('Reporte PDF generado exitosamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al generar PDF', { variant: 'error' });
    }
  };

  const exportToExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Hoja 1: Resumen
      const wsData = [
        ['Reporte del Dashboard'],
        [`Generado: ${formatDate(new Date(), true)}`],
        [],
        ['Métrica', 'Valor'],
        ['Total de Clientes', stats.totalClientes],
        ['Total de Préstamos', stats.totalPrestamos],
        ['Monto Total Prestado', stats.totalMontoPrestado],
        ['Total de Pagos Recibidos', stats.totalPagos],
        [],
        ['Préstamos por Estado'],
        ['Estado', 'Cantidad'],
        ...prestamosData.map(item => [item.name, item.value]),
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
      
      XLSX.writeFile(wb, 'dashboard-report.xlsx');
      enqueueSnackbar('Reporte Excel generado exitosamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al generar Excel', { variant: 'error' });
    }
  };

  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="body2" fontWeight="medium">{label}</Typography>
          <Typography variant="body2" color="primary.main">
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Header con acciones */}
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general del sistema de cobros"
        actions={
          <>
            <Tooltip title="Actualizar datos">
              <IconButton 
                onClick={() => fetchDashboardData(true)} 
                disabled={refreshing}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              >
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>
            <ResponsiveButton
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={exportToPDF}
              iconOnlyOnXs
              tooltip="Exportar PDF"
            >
              Exportar PDF
            </ResponsiveButton>
            <ResponsiveButton
              variant="outlined"
              startIcon={<Download />}
              onClick={exportToExcel}
              iconOnlyOnXs
              tooltip="Exportar Excel"
            >
              Exportar Excel
            </ResponsiveButton>
          </>
        }
      />

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Clientes"
            value={stats.totalClientes}
            icon={<People />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Préstamos"
            value={stats.totalPrestamos}
            icon={<AccountBalance />}
            color="secondary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Monto Prestado"
            value={formatCurrency(stats.totalMontoPrestado)}
            icon={<TrendingUp />}
            color="warning"
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Pagos Recibidos"
            value={formatCurrency(stats.totalPagos)}
            icon={<Payment />}
            color="success"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Préstamos por Estado
                </Typography>
                <TableChart color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
              ) : prestamosData.length === 0 ? (
                <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No hay datos para mostrar</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
                  <BarChart data={prestamosData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      interval={0}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    {!isMobile && <Legend />}
                    <Bar 
                      dataKey="value" 
                      fill="#00C853" 
                      name="Cantidad" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Distribución
              </Typography>
              {loading ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
              ) : prestamosData.length === 0 ? (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No hay datos</Typography>
                </Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                    <PieChart>
                      <Pie
                        data={prestamosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={isMobile ? false : ({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={isMobile ? 60 : 75}
                        innerRadius={isMobile ? 30 : 40}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {prestamosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Leyenda manual para móvil */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                    {prestamosData.map((entry, index) => (
                      <Box 
                        key={entry.name} 
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: COLORS[index % COLORS.length] 
                          }} 
                        />
                        <Typography variant="caption">
                          {entry.name} ({entry.value})
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Estilos para animación de refresh */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Dashboard;
