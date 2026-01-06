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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clientesService, carterasService } from '../services/api';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  nombre: Yup.string().required('Nombre es requerido'),
  apellido: Yup.string().required('Apellido es requerido'),
  dpi: Yup.string().required('DPI es requerido'),
  nit: Yup.string().nullable(),
  telefono: Yup.string().nullable(),
  correo: Yup.string().email('Correo inválido').nullable(),
  id_cartera: Yup.number().required('Cartera es requerida'),
});

const ClientesCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [carteras, setCarteras] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await carterasService.getAll();
        setCarteras(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      dpi: '',
      nit: '',
      telefono: '',
      correo: '',
      id_cartera: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await clientesService.create(values);
        enqueueSnackbar('Cliente creado exitosamente', { variant: 'success' });
        navigate('/app/clientes');
      } catch (err) {
        enqueueSnackbar(err.response?.data?.error || 'Error al crear cliente', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Cliente</Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ gap: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="Nombre" name="nombre" value={formik.values.nombre} onChange={formik.handleChange} error={formik.touched.nombre && Boolean(formik.errors.nombre)} helperText={formik.touched.nombre && formik.errors.nombre} />
            <TextField label="Apellido" name="apellido" value={formik.values.apellido} onChange={formik.handleChange} error={formik.touched.apellido && Boolean(formik.errors.apellido)} helperText={formik.touched.apellido && formik.errors.apellido} />
            <TextField label="DPI" name="dpi" value={formik.values.dpi} onChange={formik.handleChange} error={formik.touched.dpi && Boolean(formik.errors.dpi)} helperText={formik.touched.dpi && formik.errors.dpi} />
            <TextField label="NIT" name="nit" value={formik.values.nit} onChange={formik.handleChange} />
            <TextField label="Teléfono" name="telefono" value={formik.values.telefono} onChange={formik.handleChange} />
            <TextField label="Correo" name="correo" value={formik.values.correo} onChange={formik.handleChange} error={formik.touched.correo && Boolean(formik.errors.correo)} helperText={formik.touched.correo && formik.errors.correo} />
            <Autocomplete
              options={carteras}
              getOptionLabel={(opt) => opt.nombre}
              value={carteras.find((c) => c.id_cartera === formik.values.id_cartera) || null}
              onChange={(e, v) => formik.setFieldValue('id_cartera', v ? v.id_cartera : '')}
              renderInput={(params) => (
                <TextField {...params} label="Cartera" required error={formik.touched.id_cartera && Boolean(formik.errors.id_cartera)} helperText={formik.touched.id_cartera && formik.errors.id_cartera} />
              )}
            />
            <Button type="submit" variant="contained" sx={{ gridColumn: '1 / -1' }}>Crear Cliente</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientesCreate;
