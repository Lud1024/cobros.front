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
  MenuItem,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { verificacionesPrestamoService, clientesService } from '../services/api';
import { useSnackbar } from 'notistack';
import { formatCurrency } from '../utils/formatters';

const estadosVerificacion = ['Pendiente', 'En Proceso', 'Aprobado', 'Rechazado'];

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  fecha_solicitud: Yup.date().required('La fecha es requerida'),
  monto_solicitado: Yup.number().required('El monto es requerido').min(0),
  estado: Yup.string().required('El estado es requerido'),
  analista: Yup.string().required('El analista es requerido').max(100),
});

const VerificacionesPrestamoCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await clientesService.getAll();
        setClientes(data);
      } catch (e) {
        console.error('Error loading clientes for verificaciones', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await verificacionesPrestamoService.create(values);
      enqueueSnackbar('Verificación creada exitosamente', { variant: 'success' });
      navigate('/app/verificaciones-prestamo');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error al crear verificación', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nueva Verificación</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{ id_cliente: '', fecha_solicitud: '', monto_solicitado: '', estado: 'Pendiente', analista: '', comentarios: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={clientes}
                      getOptionLabel={(c) => `${c.nombre} ${c.apellido} - DPI: ${c.dpi}`}
                      value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                      onChange={(_, v) => setFieldValue('id_cliente', v ? v.id_cliente : '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Cliente" required error={touched.id_cliente && Boolean(errors.id_cliente)} helperText={touched.id_cliente && errors.id_cliente} />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="fecha_solicitud">
                      {({ field }) => (
                        <TextField {...field} label="Fecha de Solicitud" type="date" InputLabelProps={{ shrink: true }} fullWidth required error={touched.fecha_solicitud && Boolean(errors.fecha_solicitud)} helperText={touched.fecha_solicitud && errors.fecha_solicitud} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="monto_solicitado">
                      {({ field }) => (
                        <TextField {...field} label="Monto Solicitado (Q)" type="number" fullWidth required inputProps={{ step: '0.01', min: '0' }} error={touched.monto_solicitado && Boolean(errors.monto_solicitado)} helperText={touched.monto_solicitado && errors.monto_solicitado} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField select label="Estado" fullWidth value={values.estado} onChange={(e) => setFieldValue('estado', e.target.value)}>
                      {estadosVerificacion.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="analista">
                      {({ field }) => (
                        <TextField {...field} label="Analista" fullWidth required error={touched.analista && Boolean(errors.analista)} helperText={touched.analista && errors.analista} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="comentarios">
                      {({ field }) => (
                        <TextField {...field} label="Comentarios" fullWidth multiline rows={3} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/verificaciones-prestamo')}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>Crear</Button>
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

export default VerificacionesPrestamoCreate;
