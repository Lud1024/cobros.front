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
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { prestamosService, clientesService, periodicidadesService } from '../services/api';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  monto_prestamo: Yup.number().required('El monto es requerido').positive('Debe ser positivo'),
  tasa_interes: Yup.number().required('La tasa es requerida').min(0).max(100),
  plazo_meses: Yup.number().required('El plazo es requerido').integer().positive(),
  fecha_desembolso: Yup.date().required('La fecha es requerida'),
  id_periodicidad: Yup.number().required('La periodicidad es requerida'),
});

const PrestamosCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [clientes, setClientes] = useState([]);
  const [periodicidades, setPeriodicidades] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cData, pData] = await Promise.all([clientesService.getAll(), periodicidadesService.getAll()]);
        setClientes(cData);
        setPeriodicidades(pData);
      } catch (e) {
        console.error('Error loading data for prestamos create', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await prestamosService.create(values);
      enqueueSnackbar('Préstamo creado exitosamente', { variant: 'success' });
      navigate('/app/prestamos');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Error al crear préstamo', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Préstamo</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{
              id_cliente: '',
              monto_prestamo: '',
              tasa_interes: '',
              plazo_meses: '',
              fecha_desembolso: '',
              id_periodicidad: '',
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
                      options={clientes}
                      getOptionLabel={(opt) => `${opt.nombre} ${opt.apellido}`}
                      value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                      onChange={(_, v) => setFieldValue('id_cliente', v ? v.id_cliente : '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cliente"
                          required
                          error={touched.id_cliente && Boolean(errors.id_cliente)}
                          helperText={touched.id_cliente && errors.id_cliente}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="monto_prestamo">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Monto del Préstamo"
                          type="number"
                          fullWidth
                          InputProps={{ startAdornment: <InputAdornment position="start">Q</InputAdornment> }}
                          required
                          error={touched.monto_prestamo && Boolean(errors.monto_prestamo)}
                          helperText={touched.monto_prestamo && errors.monto_prestamo}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="tasa_interes">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Tasa de Interés (%)"
                          type="number"
                          fullWidth
                          required
                          error={touched.tasa_interes && Boolean(errors.tasa_interes)}
                          helperText={touched.tasa_interes && errors.tasa_interes}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Field name="plazo_meses">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Plazo (meses)"
                          type="number"
                          fullWidth
                          required
                          error={touched.plazo_meses && Boolean(errors.plazo_meses)}
                          helperText={touched.plazo_meses && errors.plazo_meses}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Field name="fecha_desembolso">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Fecha de Desembolso"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
                          error={touched.fecha_desembolso && Boolean(errors.fecha_desembolso)}
                          helperText={touched.fecha_desembolso && errors.fecha_desembolso}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Periodicidad"
                      fullWidth
                      value={values.id_periodicidad}
                      onChange={(e) => setFieldValue('id_periodicidad', e.target.value)}
                      required
                      error={touched.id_periodicidad && Boolean(errors.id_periodicidad)}
                      helperText={touched.id_periodicidad && errors.id_periodicidad}
                    >
                      <MenuItem value="">Seleccionar...</MenuItem>
                      {periodicidades.map((p) => (
                        <MenuItem key={p.id_periodicidad} value={p.id_periodicidad}>
                          {p.codigo} - {p.dias} días
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="observaciones">
                      {({ field }) => (
                        <TextField {...field} label="Observaciones" fullWidth multiline rows={3} />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/prestamos')}>Cancelar</Button>
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

export default PrestamosCreate;
