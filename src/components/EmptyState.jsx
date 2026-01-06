import React from 'react';
import { Box, Typography, Button, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { 
  Inbox, 
  SearchOff, 
  Error as ErrorIcon, 
  WifiOff,
  Add,
  Refresh,
} from '@mui/icons-material';

/**
 * EmptyState - Componente para mostrar estados vacíos
 */
export const EmptyState = ({
  icon: CustomIcon,
  type = 'empty', // 'empty' | 'search' | 'error' | 'offline'
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const typeConfig = {
    empty: {
      icon: Inbox,
      defaultTitle: 'No hay datos',
      defaultMessage: 'Aún no hay registros para mostrar',
      color: 'text.secondary',
    },
    search: {
      icon: SearchOff,
      defaultTitle: 'Sin resultados',
      defaultMessage: 'No se encontraron coincidencias con tu búsqueda',
      color: 'text.secondary',
    },
    error: {
      icon: ErrorIcon,
      defaultTitle: 'Error al cargar',
      defaultMessage: 'Ocurrió un error al cargar los datos',
      color: 'error.main',
    },
    offline: {
      icon: WifiOff,
      defaultTitle: 'Sin conexión',
      defaultMessage: 'Verifica tu conexión a internet',
      color: 'warning.main',
    },
  };

  const config = typeConfig[type] || typeConfig.empty;
  const Icon = CustomIcon || config.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: 80, sm: 100 },
          height: { xs: 80, sm: 100 },
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: { xs: 40, sm: 50 }, color: config.color }} />
      </Box>
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        fontWeight="medium"
        gutterBottom
        color="text.primary"
      >
        {title || config.defaultTitle}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 300, mb: actionLabel ? 3 : 0 }}
      >
        {message || config.defaultMessage}
      </Typography>
      
      {(actionLabel || secondaryActionLabel) && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <Button
              variant="contained"
              startIcon={type === 'error' || type === 'offline' ? <Refresh /> : <Add />}
              onClick={onAction}
              size={isMobile ? 'small' : 'medium'}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outlined"
              onClick={onSecondaryAction}
              size={isMobile ? 'small' : 'medium'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

/**
 * LoadingState - Componente para mostrar estado de carga
 */
export const LoadingState = ({
  message = 'Cargando...',
  size = 'medium', // 'small' | 'medium' | 'large'
  fullPage = false,
}) => {
  const sizeConfig = {
    small: { spinner: 24, py: 2 },
    medium: { spinner: 40, py: 4 },
    large: { spinner: 56, py: 6 },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: config.py,
      }}
    >
      <CircularProgress size={config.spinner} color="primary" />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

/**
 * ErrorBoundaryFallback - Fallback para errores de componentes
 */
export const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <EmptyState
      type="error"
      title="Algo salió mal"
      message={error?.message || 'Ha ocurrido un error inesperado'}
      actionLabel="Reintentar"
      onAction={resetErrorBoundary}
    />
  );
};

export default EmptyState;
