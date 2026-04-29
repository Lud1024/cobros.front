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
  Divider,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { prestamosService, clientesService, periodicidadesService } from '../services/api';
import { formatCurrency, isValidDateInput } from '../utils/formatters';
import { useSnackbar } from 'notistack';
import DateInputField from '../components/DateInputField';

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  monto_prestamo: Yup.number().required('El monto es requerido').positive('Debe ser positivo'),
  tasa_interes: Yup.number().required('La tasa es requerida').min(0).max(100),
  plazo_meses: Yup.number().required('El plazo es requerido').integer().positive(),
  fecha_desembolso: Yup.string()
    .required('La fecha es requerida')
    .test('fecha-valida', 'Fecha invalida', isValidDateInput),
  id_periodicidad: Yup.number().required('La periodicidad es requerida'),
  dia_pago: Yup.number().required('El día de pago es requerido').min(1, 'Mínimo 1').max(31, 'Máximo 31'),
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

  const calcularResumen = (values) => {
    const monto = Number(values.monto_prestamo);
    const tasa = Number(values.tasa_interes);
    const plazo = Number(values.plazo_meses);
    const periodicidad = periodicidades.find((p) => Number(p.id_periodicidad) === Number(values.id_periodicidad));

    if (!monto || !plazo || !periodicidad || tasa < 0) {
      return null;
    }

    const diasPeriodo = Math.max(Number(periodicidad.dias) || 30, 1);
    const tasaPeriodo = (tasa / 100) / (365 / diasPeriodo);
    const cuota = tasaPeriodo > 0
      ? monto * (tasaPeriodo / (1 - Math.pow(1 + tasaPeriodo, -plazo)))
      : monto / plazo;
    const total = cuota * plazo;

    return {
      cuota,
      total,
      intereses: total - monto,
      periodicidad
    };
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
              dia_pago: 1,
              observaciones: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => {
              const resumen = calcularResumen(values);

              return (
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
                          label="Plazo (cuotas)"
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
                      {({ field, form }) => (
                        <DateInputField
                          field={field}
                          form={form}
                          label="Fecha de Desembolso"
                          InputLabelProps={{ shrink: true }}
                          fullWidth
                          required
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

                  <Grid item xs={12} sm={4}>
                    <Field name="dia_pago">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Día de Pago (1-31)"
                          type="number"
                          fullWidth
                          required
                          inputProps={{ min: 1, max: 31 }}
                          error={touched.dia_pago && Boolean(errors.dia_pago)}
                          helperText={touched.dia_pago && errors.dia_pago}
                        />
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

                  {resumen && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Cuota estimada</Typography>
                          <Typography variant="h6" color="primary.main">{formatCurrency(resumen.cuota)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Total a pagar</Typography>
                          <Typography variant="body1" fontWeight={600}>{formatCurrency(resumen.total)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">Intereses estimados</Typography>
                          <Typography variant="body1" fontWeight={600}>{formatCurrency(resumen.intereses)}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/prestamos')}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {isSubmitting ? 'Creando...' : 'Crear'}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PrestamosCreate;
