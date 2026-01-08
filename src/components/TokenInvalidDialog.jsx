import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const TokenInvalidDialog = () => {
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const handleTokenInvalid = (event) => {
      setMensaje(event.detail.mensaje);
      setOpen(true);
    };

    window.addEventListener('token-invalid', handleTokenInvalid);

    return () => {
      window.removeEventListener('token-invalid', handleTokenInvalid);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
    window.location.href = '/';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="token-invalid-dialog-title"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="token-invalid-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorOutlineIcon color="error" />
        Sesión Inválida
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {mensaje}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary" autoFocus>
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenInvalidDialog;
