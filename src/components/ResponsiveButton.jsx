import React from 'react';
import { Button, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';

/**
 * ResponsiveButton - Botón que se adapta al tamaño de pantalla
 * En móvil puede mostrar solo el ícono o ser más compacto
 */
const ResponsiveButton = ({ 
  children, 
  startIcon, 
  variant = 'contained', 
  onClick, 
  sx = {}, 
  fullWidthOnXs = false,
  iconOnlyOnXs = false,
  tooltip = '',
  color = 'primary',
  disabled = false,
  ...rest 
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const size = isXs ? 'small' : 'medium';
  const fullWidth = isXs && fullWidthOnXs;

  // Si iconOnlyOnXs está activo y estamos en móvil, mostrar solo el ícono
  if (iconOnlyOnXs && isXs && startIcon) {
    const iconButton = (
      <IconButton
        color={color}
        onClick={onClick}
        disabled={disabled}
        size="small"
        sx={{
          bgcolor: variant === 'contained' ? `${color}.main` : 'transparent',
          color: variant === 'contained' ? 'white' : `${color}.main`,
          border: variant === 'outlined' ? 1 : 0,
          borderColor: `${color}.main`,
          '&:hover': {
            bgcolor: variant === 'contained' ? `${color}.dark` : `${color}.light`,
          },
          ...sx,
        }}
        {...rest}
      >
        {startIcon}
      </IconButton>
    );

    if (tooltip || children) {
      return (
        <Tooltip title={tooltip || children} arrow>
          {iconButton}
        </Tooltip>
      );
    }
    return iconButton;
  }

  const defaultSx = {
    minWidth: isXs ? 100 : 140,
    borderRadius: 2,
    px: isXs ? 1.5 : 2,
    py: isXs ? 0.75 : 1,
    fontSize: isXs ? '0.8125rem' : '0.875rem',
    whiteSpace: 'nowrap',
    ...sx,
  };

  return (
    <Button
      variant={variant}
      color={color}
      startIcon={startIcon}
      onClick={onClick}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      sx={defaultSx}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ResponsiveButton;
