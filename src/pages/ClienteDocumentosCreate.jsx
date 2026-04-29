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
  Stack,
  LinearProgress,
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { clienteDocumentosService, clientesService } from '../services/api';
import { useSnackbar } from 'notistack';

const tiposDocumento = [
  'DPI',
  'Contrato de Prestamo',
  'Recibo de Pago',
  'Comprobante de Ingresos',
  'Comprobante de Domicilio',
  'Garantia',
  'PDF',
  'EXCEL',
  'OTRO',
];
const MAX_PDF_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

const validationSchema = Yup.object({
  id_cliente: Yup.number().required('El cliente es requerido'),
  tipo_documento: Yup.string().required('El tipo de archivo es requerido'),
  nombre_archivo: Yup.string().required('El nombre del archivo es requerido').max(255),
  ruta_storage: Yup.string().max(500),
});

const ClienteDocumentosCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [clientes, setClientes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');

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

  const handleSubmit = async (
    values,
    { setSubmitting, setFieldValue, setFieldTouched, setFieldError }
  ) => {
    try {
      setUploading(true);

      let fileId = values.ruta_storage;
      if (!fileId) {
        if (!selectedFile) {
          setFileError('Debe seleccionar un archivo PDF');
          setFieldTouched('ruta_storage', true, false);
          setFieldError('ruta_storage', 'Debe seleccionar un archivo PDF');
          enqueueSnackbar('Debe seleccionar un archivo PDF', { variant: 'error' });
          return;
        }

        setFileError('');
        const result = await uploadPdfToExternalApi(selectedFile);
        fileId = result?.fileId || '';

        if (!fileId) {
          throw new Error('La respuesta de carga no devolvió fileId');
        }

        setFieldValue('ruta_storage', fileId);
        setFieldTouched('ruta_storage', true, false);
        enqueueSnackbar('Archivo subido exitosamente', { variant: 'success' });
      }

      await clienteDocumentosService.create({ ...values, ruta_storage: fileId });
      enqueueSnackbar('Documento creado exitosamente', { variant: 'success' });
      navigate('/app/cliente-documentos', { replace: true });
    } catch (error) {
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      enqueueSnackbar(apiMessage || error?.message || 'Error al crear documento', { variant: 'error' });
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const uploadPdfToExternalApi = async (file) => {
    if (!file) throw new Error('Selecciona un archivo PDF');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Solo se permiten archivos PDF');
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error('El archivo excede el tamaño máximo permitido (3MB)');
    }

    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.onload = () => {
        const result = reader.result;
        if (!result || typeof result !== 'string') {
          reject(new Error('Lectura de archivo inválida'));
          return;
        }

        // Recortar encabezado: data:application/pdf;base64,
        let pureBase64 = result.replace(/^data:application\/pdf;base64,/, '');
        // Fallback por si el navegador devuelve un encabezado distinto
        if (pureBase64 === result && result.includes(',')) {
          pureBase64 = result.split(',')[1];
        }
        resolve(pureBase64);
      };
      reader.readAsDataURL(file);
    });

    const body = new URLSearchParams({
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      fileData: base64Data,
    });

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxuncJN6X0sc_ut9x9GP66CBzmxrYuzVI5Y7iyR5RUXL1jMt8Ugxuy1RWYle0Cl7G-N/exec',
      {
        method: 'POST',
        body,
      }
    );

    // Apps Script a veces responde texto/HTML en errores; intentar JSON y si no, usar texto.
    const contentType = response.headers.get('content-type') || '';
    let json;
    if (contentType.includes('application/json')) {
      json = await response.json();
    } else {
      const text = await response.text();
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(text || `Error HTTP ${response.status}`);
      }
    }

    if (!response.ok) {
      throw new Error(json?.message || json?.error || `Error HTTP ${response.status}`);
    }

    if (json?.status === 'success') {
      return json;
    }

    throw new Error(json?.message || json?.error || 'Error al subir archivo');
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
            {({ errors, touched, isSubmitting, setFieldValue, setFieldTouched, setFieldError, values }) => (
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
                          label="Tipo de Archivo"
                          required
                          error={touched.tipo_documento && Boolean(errors.tipo_documento)}
                          helperText={touched.tipo_documento && errors.tipo_documento}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
                      Archivo PDF
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={uploading || isSubmitting}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Seleccionar archivo
                          <input
                            hidden
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;

                              if (file && file.size > MAX_PDF_SIZE_BYTES) {
                                e.target.value = '';
                                setSelectedFile(null);
                                setFileError('El archivo excede el tamano maximo permitido (3MB)');
                                setFieldValue('ruta_storage', '');
                                setFieldTouched('ruta_storage', true, false);
                                setFieldError('ruta_storage', 'El archivo excede el tamaño máximo permitido (3MB)');
                                enqueueSnackbar('El archivo excede el tamaño máximo permitido (3MB)', { variant: 'error' });
                                return;
                              }

                              setSelectedFile(file);
                              setFileError('');
                              // Reiniciar ruta_storage si cambian el archivo
                              setFieldValue('ruta_storage', '');

                              if (file) {
                                // Guardar nombre para BD (campo oculto)
                                setFieldValue('nombre_archivo', file.name);
                              }
                            }}
                          />
                        </Button>
                        <Typography
                          variant="body2"
                          color={selectedFile ? 'text.primary' : 'text.secondary'}
                          sx={{ flex: 1, minWidth: 0 }}
                          noWrap
                          title={selectedFile?.name || ''}
                        >
                          {selectedFile?.name || 'Ningún archivo seleccionado'}
                        </Typography>
                      </Stack>

                      {uploading ? <LinearProgress sx={{ mt: 1 }} /> : null}

                      {fileError ? (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          {fileError}
                        </Alert>
                      ) : null}

                      {values.ruta_storage ? (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Archivo cargado y listo para guardar.
                        </Alert>
                      ) : (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          El archivo se sube automáticamente al presionar “Crear”.
                        </Alert>
                      )}

                      {touched.ruta_storage && errors.ruta_storage ? (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
                          {errors.ruta_storage}
                        </Typography>
                      ) : null}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="nombre_archivo">
                      {({ field }) => <input type="hidden" {...field} />}
                    </Field>
                    <Field name="ruta_storage">
                      {({ field }) => <input type="hidden" {...field} />}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/app/cliente-documentos', { replace: true })}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting || uploading}>
                      {isSubmitting || uploading ? 'Guardando...' : 'Crear'}
                    </Button>
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
