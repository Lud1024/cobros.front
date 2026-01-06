import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { pagosService, prestamosService, clientesService } from '../services/api';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  id_prestamo: Yup.number().required('El préstamo es requerido'),
  fecha_pago: Yup.date().required('La fecha de pago es requerida'),
  monto: Yup.number().required('El monto es requerido').positive('Debe ser positivo'),
  metodo_pago: Yup.string().required('El método de pago es requerido'),
});

const PagosCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [prestamos, setPrestamos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, cData] = await Promise.all([prestamosService.getAll(), clientesService.getAll()]);
        setPrestamos(pData);
        setClientes(cData);
      } catch (e) {
        console.error('Error cargando datos para pagos create', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await pagosService.create(values);
      enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
      navigate('/app/pagos');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Error al registrar pago', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Registrar Pago</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{
              id_prestamo: '',
              fecha_pago: new Date().toISOString().split('T')[0],
              monto: '',
              metodo_pago: 'Efectivo',
              numero_recibo: '',
              observaciones: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={prestamos}
                      getOptionLabel={(option) => {
                        const cliente = clientes.find((c) => c.id_cliente === option.id_cliente);
                        return cliente
                          ? `${cliente.nombre} ${cliente.apellido} - Préstamo #${option.id_prestamo} (${option.monto_prestamo || ''})`
                          : `Préstamo #${option.id_prestamo}`;
                      }}
                      value={prestamos.find((p) => p.id_prestamo === values.id_prestamo) || null}
                      onChange={(_, newValue) => setFieldValue('id_prestamo', newValue ? newValue.id_prestamo : '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Préstamo"
                          required
                          error={touched.id_prestamo && Boolean(errors.id_prestamo)}
                          helperText={touched.id_prestamo && errors.id_prestamo}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="fecha_pago">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Fecha de Pago"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          error={touched.fecha_pago && Boolean(errors.fecha_pago)}
                          helperText={touched.fecha_pago && errors.fecha_pago}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="monto">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Monto"
                          type="number"
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                          required
                          error={touched.monto && Boolean(errors.monto)}
                          helperText={touched.monto && errors.monto}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Método de Pago"
                      value={values.metodo_pago}
                      onChange={(e) => setFieldValue('metodo_pago', e.target.value)}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Yape">Yape</option>
                      <option value="Plin">Plin</option>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="numero_recibo">
                      {({ field }) => (
                        <TextField {...field} label="Número de Recibo" fullWidth />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="observaciones">
                      {({ field }) => (
                        <TextField {...field} label="Observaciones" fullWidth multiline rows={3} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/pagos')}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>Registrar</Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PagosCreate;
