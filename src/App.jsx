import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import TokenInvalidDialog from './components/TokenInvalidDialog';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClientesCreate from './pages/ClientesCreate';
import ClienteDocumentos from './pages/ClienteDocumentos';
import ClienteDocumentosCreate from './pages/ClienteDocumentosCreate';
import Carteras from './pages/Carteras';
import Usuarios from './pages/Usuarios';
import Prestamos from './pages/Prestamos';
import PrestamosCreate from './pages/PrestamosCreate';
import PrestamoGarantia from './pages/PrestamoGarantia';
import PrestamoGarantiaCreate from './pages/PrestamoGarantiaCreate';
import VerificacionesPrestamo from './pages/VerificacionesPrestamo';
import VerificacionesPrestamoCreate from './pages/VerificacionesPrestamoCreate';
import RechazosHistorial from './pages/RechazosHistorial';
import Pagos from './pages/Pagos';
import PagosCreate from './pages/PagosCreate';
import RechazosHistorialCreate from './pages/RechazosHistorialCreate';
import PagoAplicaciones from './pages/PagoAplicaciones';
import Cuotas from './pages/Cuotas';
import MoraEventos from './pages/MoraEventos';
import PoliticasMora from './pages/PoliticasMora';
import VisitasCobro from './pages/VisitasCobro';
import MetodosGarantia from './pages/MetodosGarantia';
import Periodicidades from './pages/Periodicidades';
import Roles from './pages/Roles';
import RolCartera from './pages/RolCartera';
import UsuarioRoles from './pages/UsuarioRoles';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Perfil from './pages/Perfil';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TokenInvalidDialog />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <AuthProvider>
          <Router>
            <Routes>
              {/* Ruta principal: Login */}
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Rutas protegidas */}
              <Route
                path="/app"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Clientes */}
                <Route path="clientes" element={<Clientes />} />
                <Route path="clientes/nuevo" element={<ClientesCreate />} />
                <Route path="cliente-documentos" element={<ClienteDocumentos />} />
                <Route path="cliente-documentos/nuevo" element={<ClienteDocumentosCreate />} />
                
                {/* Carteras */}
                <Route path="carteras" element={<Carteras />} />
                
                {/* Préstamos */}
                <Route path="prestamos" element={<Prestamos />} />
                <Route path="prestamos/nuevo" element={<PrestamosCreate />} />
                <Route path="prestamo-garantia" element={<PrestamoGarantia />} />
                <Route path="prestamo-garantia/nuevo" element={<PrestamoGarantiaCreate />} />
                <Route path="verificaciones-prestamo" element={<VerificacionesPrestamo />} />
                <Route path="verificaciones-prestamo/nuevo" element={<VerificacionesPrestamoCreate />} />
                <Route path="rechazos-historial" element={<RechazosHistorial />} />
                <Route path="rechazos-historial/nuevo" element={<RechazosHistorialCreate />} />
                
                {/* Pagos y Cuotas */}
                <Route path="pagos" element={<Pagos />} />
                <Route path="pagos/nuevo" element={<PagosCreate />} />
                <Route path="pago-aplicaciones" element={<PagoAplicaciones />} />
                <Route path="cuotas" element={<Cuotas />} />
                
                {/* Mora */}
                <Route path="mora-eventos" element={<MoraEventos />} />
                <Route path="politicas-mora" element={<PoliticasMora />} />
                
                {/* Cobro */}
                <Route path="visitas-cobro" element={<VisitasCobro />} />
                
                {/* Configuración */}
                <Route path="metodos-garantia" element={<MetodosGarantia />} />
                <Route path="periodicidades" element={<Periodicidades />} />
                
                {/* Usuarios y Roles */}
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="roles" element={<Roles />} />
                <Route path="rol-cartera" element={<RolCartera />} />
                <Route path="usuario-roles" element={<UsuarioRoles />} />
                
                {/* Otros */}
                <Route path="reportes" element={<Reportes />} />
                <Route path="configuracion" element={<Configuracion />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>

              {/* Cualquier ruta no encontrada redirige al login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
