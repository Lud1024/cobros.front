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
  Alert,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { clienteDocumentosService, clientesService } from '../services/api';
import { useSnackbar } from 'notistack';

const tiposDocumento = [
  'DPI',
  'Pasaporte',
  'Recibo de Luz',
  'Recibo de Agua',
  'Contrato de Alquiler',
  'Escritura',
  'Otro',
];

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  tipo_documento: Yup.string().required('El tipo de documento es requerido'),
  nombre_archivo: Yup.string().required('El nombre del archivo es requerido').max(255),
  ruta_storage: Yup.string().required('La ruta es requerida').max(500),
});

const ClienteDocumentosCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await clientesService.getAll();
        setClientes(data);
      } catch (error) {
        console.error('Error loading clientes', error);
      }
    };
    loadClientes();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await clienteDocumentosService.create(values);
      enqueueSnackbar('Documento creado exitosamente', { variant: 'success' });
      navigate('/app/cliente-documentos');
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error al crear documento', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nuevo Documento</Typography>
      <Card>
        <CardContent>
          <Formik
            initialValues={{
              id_cliente: '',
              tipo_documento: '',
              nombre_archivo: '',
              ruta_storage: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={clientes}
                      getOptionLabel={(option) => `${option.nombre} ${option.apellido} - DPI: ${option.dpi}`}
                      value={clientes.find((c) => c.id_cliente === values.id_cliente) || null}
                      onChange={(e, newValue) => setFieldValue('id_cliente', newValue ? newValue.id_cliente : '')}
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
                    <Autocomplete
                      options={tiposDocumento}
                      value={values.tipo_documento || null}
                      onChange={(e, newValue) => setFieldValue('tipo_documento', newValue || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo de Documento"
                          required
                          error={touched.tipo_documento && Boolean(errors.tipo_documento)}
                          helperText={touched.tipo_documento && errors.tipo_documento}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="nombre_archivo">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Nombre del Archivo"
                          fullWidth
                          required
                          error={touched.nombre_archivo && Boolean(errors.nombre_archivo)}
                          helperText={touched.nombre_archivo && errors.nombre_archivo}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="ruta_storage">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Ruta de Almacenamiento"
                          fullWidth
                          required
                          error={touched.ruta_storage && Boolean(errors.ruta_storage)}
                          helperText={touched.ruta_storage && errors.ruta_storage}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/cliente-documentos')}>Cancelar</Button>
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

export default ClienteDocumentosCreate;
