import { Box, Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  People,
  Assessment,
} from '@mui/icons-material';

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Gestión de Préstamos',
      description: 'Administra préstamos de forma eficiente con tasas de interés y plazos flexibles.',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Control de Clientes',
      description: 'Mantén un registro completo de tus clientes y su información de contacto.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Seguimiento de Pagos',
      description: 'Registra y monitorea todos los pagos con múltiples métodos de pago.',
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: 'Reportes Detallados',
      description: 'Genera reportes en PDF y Excel para análisis y documentación.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Sistema Seguro',
      description: 'Protección con autenticación JWT y encriptación de datos.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Interfaz Rápida',
      description: 'Diseño moderno y responsive con búsqueda en tiempo real.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            Sistema de Gestión de Préstamos y Cobros
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Administra tu cartera de préstamos de forma profesional y eficiente
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Crear Cuenta
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          Características Principales
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 6,
          mt: 'auto',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            ¿Listo para comenzar?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Crea tu cuenta gratuita y empieza a gestionar tus préstamos hoy mismo
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Registrarse Ahora
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          © 2025 Sistema de Préstamos y Cobros. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default Welcome;
