import { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, Person } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = Yup.object({
  usuario: Yup.string()
    .required('El usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      usuario: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
    try {
      setError('');
      logger.info('Attempting login', { usuario: values.usuario });
      await login(values.usuario, values.password);
      logger.info('Login successful', { usuario: values.usuario });
      navigate('/app/dashboard', { replace: true });
      } catch (err) {
        // Improved mapping to show clear messages and log responses for debugging
        const apiErr = err.response?.data?.error;
        const status = err.response?.status;
  logger.error('Login error response', { status, apiErr });
        if (status === 404 || apiErr === 'USUARIO NO EXISTE') {
          setError('USUARIO NO EXISTE');
        } else if (apiErr === 'USUARIO INACTIVO') {
          setError('USUARIO INACTIVO');
        } else if (status === 401 && apiErr === 'CONTRASEÑA INCORRECTA') {
          setError('CONTRASEÑA INCORRECTA');
        } else if (status === 401 && apiErr === 'Credenciales inválidas') {
          // Backwards compatibility with older backend messages
          setError('CONTRASEÑA INCORRECTA');
        } else if (!status) {
          setError('ERROR DE CONEXIÓN');
        } else {
          setError(apiErr || 'Error al iniciar sesión');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // auto-dismiss error alert after a few seconds
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minHeight: '100dvh', // Usa dvh para móviles (viewport dinámico)
        height: '100vh',
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #00C853 0%, #C8E6A0 50%, #E0F2D0 100%)',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
        overflow: 'auto',
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Card 
          elevation={isMobile ? 2 : 6}
          sx={{
            width: '100%',
            maxWidth: 450,
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 3, sm: 4 } }}>
              <Box
                component="img"
                src="/credi.png"
                alt="Créditos La Unión"
                sx={{
                  width: { xs: 100, sm: 140 },
                  height: { xs: 100, sm: 140 },
                  mb: { xs: 2, sm: 2.5 },
                  objectFit: 'contain',
                }}
              />
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 700,
                  fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  textAlign: 'center',
                  mb: 1,
                }}
              >
                Iniciar Sesión
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  textAlign: 'center',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  fontWeight: 500,
                }}
              >
                Sistema de Gestión de Préstamos y Cobros
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2.5,
                  borderRadius: 1.5,
                  '& .MuiAlert-message': {
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    width: '100%',
                  },
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="usuario"
                name="usuario"
                label="Usuario"
                margin="normal"
                value={formik.values.usuario}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.usuario && Boolean(formik.errors.usuario)}
                helperText={formik.touched.usuario && formik.errors.usuario}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5,
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '16px', sm: '1rem' }, // 16px previene zoom en iOS
                    py: { xs: 1.5, sm: 1.75 },
                  },
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size={isMobile ? 'small' : 'medium'}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    borderRadius: 1.5,
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '16px', sm: '1rem' },
                    py: { xs: 1.5, sm: 1.75 },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={formik.isSubmitting}
                sx={{ 
                  mt: 3.5, 
                  mb: 2,
                  py: { xs: 1.5, sm: 1.75 },
                  fontSize: { xs: '1rem', sm: '1.0625rem' },
                  fontWeight: 600,
                  borderRadius: 1.5,
                  position: 'relative',
                  textTransform: 'none',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                {formik.isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>
            {/* Inline Alert handles showing the error inside the login card; no global Snackbar */}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
