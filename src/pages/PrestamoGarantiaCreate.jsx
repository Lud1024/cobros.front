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
  Autocomplete,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { prestamoGarantiaService, prestamosService, metodosGarantiaService } from '../services/api';
import { useSnackbar } from 'notistack';
import { formatCurrency } from '../utils/formatters';

const validationSchema = Yup.object({
  id_prestamo: Yup.number().required('El préstamo es requerido'),
  id_metodo: Yup.number().required('El método de garantía es requerido'),
  valor_garantia: Yup.number().required('El valor es requerido').min(0),
});

const PrestamoGarantiaCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [prestamos, setPrestamos] = useState([]);
  const [metodos, setMetodos] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, mData] = await Promise.all([prestamosService.getAll(), metodosGarantiaService.getAll()]);
        setPrestamos(pData);
        setMetodos(mData);
      } catch (e) {
        console.error('Error loading prestamos/metodos', e);
      }
    };
    load();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await prestamoGarantiaService.create(values);
      enqueueSnackbar('Garantía creada exitosamente', { variant: 'success' });
      navigate('/app/prestamo-garantia');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error al crear garantía', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nueva Garantía</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{ id_prestamo: '', id_metodo: '', valor_garantia: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={prestamos}
                      getOptionLabel={(opt) => `Préstamo #${opt.id_prestamo} - ${formatCurrency(opt.monto)}`}
                      value={prestamos.find((p) => p.id_prestamo === values.id_prestamo) || null}
                      onChange={(_, v) => setFieldValue('id_prestamo', v ? v.id_prestamo : '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Préstamo" required error={touched.id_prestamo && Boolean(errors.id_prestamo)} helperText={touched.id_prestamo && errors.id_prestamo} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={metodos}
                      getOptionLabel={(opt) => opt.nombre_metodo}
                      value={metodos.find((m) => m.id_metodo === values.id_metodo) || null}
                      onChange={(_, v) => setFieldValue('id_metodo', v ? v.id_metodo : '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Método de Garantía" required error={touched.id_metodo && Boolean(errors.id_metodo)} helperText={touched.id_metodo && errors.id_metodo} />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="valor_garantia">
                      {({ field }) => (
                        <TextField {...field} label="Valor de la Garantía (Q)" type="number" fullWidth required inputProps={{ step: '0.01', min: '0' }} error={touched.valor_garantia && Boolean(errors.valor_garantia)} helperText={touched.valor_garantia && errors.valor_garantia} />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/prestamo-garantia')}>Cancelar</Button>
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

export default PrestamoGarantiaCreate;
