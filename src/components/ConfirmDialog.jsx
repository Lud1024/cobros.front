import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import { Close, Warning, Delete, Info, CheckCircle } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ConfirmDialog - Diálogo de confirmación responsive
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const typeConfig = {
    warning: {
      icon: <Warning />,
      color: 'warning.main',
      bgColor: 'warning.light',
      buttonColor: 'warning',
    },
    danger: {
      icon: <Delete />,
      color: 'error.main',
      bgColor: 'error.light',
      buttonColor: 'error',
    },
    info: {
      icon: <Info />,
      color: 'info.main',
      bgColor: 'info.light',
      buttonColor: 'info',
    },
    success: {
      icon: <CheckCircle />,
      color: 'success.main',
      bgColor: 'success.light',
      buttonColor: 'success',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          m: isMobile ? 2 : 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: config.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
              }}
            >
              {config.icon}
            </Box>
            <Typography variant="h6" component="span" fontWeight="medium">
              {title}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small" 
            disabled={loading}
            sx={{ color: 'text.secondary' }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          fullWidth={isMobile}
          sx={{ minWidth: 100 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={config.buttonColor}
          fullWidth={isMobile}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Procesando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
