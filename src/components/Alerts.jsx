import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Close,
} from '@mui/icons-material';

/**
 * StatusAlert - Alerta con estado persistente y estilos mejorados
 */
export const StatusAlert = ({
  open = true,
  severity = 'info',
  title,
  message,
  onClose,
  closable = true,
  icon,
  action,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const icons = {
    success: <CheckCircle />,
    error: <Error />,
    warning: <Warning />,
    info: <Info />,
  };

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        icon={icon || icons[severity]}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {action}
            {closable && onClose && (
              <IconButton
                size="small"
                color="inherit"
                onClick={onClose}
                aria-label="Cerrar alerta"
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
          ...sx,
        }}
      >
        {title && <AlertTitle sx={{ fontWeight: 600 }}>{title}</AlertTitle>}
        {typeof message === 'string' ? (
          <Typography variant="body2">{message}</Typography>
        ) : (
          message
        )}
      </Alert>
    </Collapse>
  );
};

/**
 * Toast - Notificación temporal tipo toast
 */
export const Toast = ({
  open,
  onClose,
  message,
  severity = 'success',
  autoHideDuration = 4000,
  position = { vertical: 'bottom', horizontal: 'center' },
  action,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // En móvil, ajustar posición
  const mobilePosition = isMobile 
    ? { vertical: 'bottom', horizontal: 'center' }
    : position;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={mobilePosition}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '90vw', sm: 'auto' },
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        action={action}
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: theme.shadows[6],
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

/**
 * InlineMessage - Mensaje inline para formularios y validación
 */
export const InlineMessage = ({
  type = 'info',
  children,
  icon,
  show = true,
  sx = {},
}) => {
  const colors = {
    success: { bg: 'success.lighter', color: 'success.main', borderColor: 'success.light' },
    error: { bg: 'error.lighter', color: 'error.main', borderColor: 'error.light' },
    warning: { bg: 'warning.lighter', color: 'warning.main', borderColor: 'warning.light' },
    info: { bg: 'info.lighter', color: 'info.main', borderColor: 'info.light' },
  };

  const icons = {
    success: <CheckCircle fontSize="small" />,
    error: <Error fontSize="small" />,
    warning: <Warning fontSize="small" />,
    info: <Info fontSize="small" />,
  };

  if (!show) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1.5,
        borderRadius: 1,
        bgcolor: colors[type]?.bg || 'grey.100',
        borderLeft: 3,
        borderColor: colors[type]?.borderColor || 'grey.400',
        ...sx,
      }}
    >
      <Box sx={{ color: colors[type]?.color || 'grey.600', mt: 0.25 }}>
        {icon || icons[type]}
      </Box>
      <Typography 
        variant="body2" 
        sx={{ color: 'text.primary', flex: 1 }}
      >
        {children}
      </Typography>
    </Box>
  );
};

/**
 * ConnectionStatus - Indicador de estado de conexión
 */
export const ConnectionStatus = ({ online, onRetry }) => {
  return (
    <Collapse in={!online}>
      <Alert
        severity="warning"
        action={
          onRetry && (
            <IconButton
              color="inherit"
              size="small"
              onClick={onRetry}
              aria-label="Reintentar conexión"
            >
              <Typography variant="button">Reintentar</Typography>
            </IconButton>
          )
        }
        sx={{
          borderRadius: 0,
          '& .MuiAlert-icon': {
            animation: 'pulse 2s infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        }}
      >
        Sin conexión a internet. Algunas funciones pueden no estar disponibles.
      </Alert>
    </Collapse>
  );
};

/**
 * FormErrors - Mostrar errores de formulario de manera elegante
 */
export const FormErrors = ({ errors = [], title = 'Por favor corrige los siguientes errores:', sx = {} }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <StatusAlert
      severity="error"
      title={title}
      closable={false}
      message={
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {errors.map((error, index) => (
            <li key={index}>
              <Typography variant="body2">{error}</Typography>
            </li>
          ))}
        </Box>
      }
      sx={{ mb: 2, ...sx }}
    />
  );
};

export default {
  StatusAlert,
  Toast,
  InlineMessage,
  ConnectionStatus,
  FormErrors,
};
