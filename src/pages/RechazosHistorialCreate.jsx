import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Autocomplete,
  Grid,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { rechazosHistorialService, verificacionesPrestamoService } from '../services/api';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  id_verificacion: Yup.number().required('La verificación es requerida'),
  motivo: Yup.string().required('El motivo es requerido'),
});

const RechazosHistorialCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [verificaciones, setVerificaciones] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await verificacionesPrestamoService.getAll();
        setVerificaciones(data);
      } catch (e) {
        console.error('Error cargando verificaciones', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await rechazosHistorialService.create(values);
      enqueueSnackbar('Rechazo creado exitosamente', { variant: 'success' });
      navigate('/app/rechazos-historial');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Error al crear rechazo', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Rechazo</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{ id_verificacion: '', motivo: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={verificaciones}
                      getOptionLabel={(o) => `Verificación #${o.id_verificacion} - ${o.analista || ''}`}
                      value={verificaciones.find((v) => v.id_verificacion === values.id_verificacion) || null}
                      onChange={(e, newValue) => setFieldValue('id_verificacion', newValue ? newValue.id_verificacion : '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Verificación"
                          required
                          error={touched.id_verificacion && Boolean(errors.id_verificacion)}
                          helperText={touched.id_verificacion && errors.id_verificacion}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="motivo">
                      {({ field }) => (
                        <TextField {...field} label="Motivo del Rechazo" fullWidth multiline rows={4} required error={touched.motivo && Boolean(errors.motivo)} helperText={touched.motivo && errors.motivo} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/rechazos-historial')}>Cancelar</Button>
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

export default RechazosHistorialCreate;
