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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clientesService, carterasService } from '../services/api';
import { useSnackbar } from 'notistack';

const validationSchema = Yup.object({
  nombre: Yup.string().trim().required('Nombre es requerido'),
  apellido: Yup.string().trim().required('Apellido es requerido'),
  dpi: Yup.string()
    .trim()
    .matches(/^\d{13}$/, 'El DPI debe tener 13 digitos')
    .required('DPI es requerido'),
  nit: Yup.string()
    .trim()
    .matches(/^$|^\d{1,12}-[\dkK]$/, 'Formato de NIT invalido, ejemplo 1234567-8')
    .nullable(),
  direccion: Yup.string().trim().required('Direccion es requerida'),
  telefono: Yup.string()
    .trim()
    .matches(/^$|^\d{8}$/, 'El telefono debe tener 8 digitos')
    .nullable(),
  correo: Yup.string().trim().email('Correo invalido').nullable(),
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
      direccion: '',
      telefono: '',
      correo: '',
      id_cartera: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          dpi: values.dpi.trim(),
          nit: values.nit?.trim() || null,
          direccion: values.direccion.trim(),
          telefono: values.telefono?.trim() || null,
          correo: values.correo?.trim() || null,
        };
        await clientesService.create(payload);
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
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}
          >
            <TextField
              label="Nombre"
              name="nombre"
              required
              value={formik.values.nombre}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
            />
            <TextField
              label="Apellido"
              name="apellido"
              required
              value={formik.values.apellido}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.apellido && Boolean(formik.errors.apellido)}
              helperText={formik.touched.apellido && formik.errors.apellido}
            />
            <TextField
              label="DPI"
              name="dpi"
              required
              value={formik.values.dpi}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ inputMode: 'numeric', maxLength: 13 }}
              error={formik.touched.dpi && Boolean(formik.errors.dpi)}
              helperText={formik.touched.dpi && formik.errors.dpi}
            />
            <TextField
              label="NIT"
              name="nit"
              value={formik.values.nit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="1234567-8"
              error={formik.touched.nit && Boolean(formik.errors.nit)}
              helperText={formik.touched.nit && formik.errors.nit}
            />
            <TextField
              label="Direccion"
              name="direccion"
              required
              value={formik.values.direccion}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.direccion && Boolean(formik.errors.direccion)}
              helperText={formik.touched.direccion && formik.errors.direccion}
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              label="Telefono"
              name="telefono"
              value={formik.values.telefono}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              error={formik.touched.telefono && Boolean(formik.errors.telefono)}
              helperText={formik.touched.telefono && formik.errors.telefono}
            />
            <TextField
              label="Correo"
              name="correo"
              value={formik.values.correo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.correo && Boolean(formik.errors.correo)}
              helperText={formik.touched.correo && formik.errors.correo}
            />
            <Autocomplete
              options={carteras}
              getOptionLabel={(opt) => opt.nombre}
              value={carteras.find((c) => c.id_cartera === formik.values.id_cartera) || null}
              onChange={(e, v) => formik.setFieldValue('id_cartera', v ? v.id_cartera : '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cartera"
                  required
                  error={formik.touched.id_cartera && Boolean(formik.errors.id_cartera)}
                  helperText={formik.touched.id_cartera && formik.errors.id_cartera}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ gridColumn: '1 / -1' }}
            >
              {formik.isSubmitting ? 'Guardando...' : 'Crear Cliente'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientesCreate;
