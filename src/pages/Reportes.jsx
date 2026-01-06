import { Typography, Box, Card, CardContent, Grid } from '@mui/material';

const Reportes = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Reportes y Análisis
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reporte de Cartera
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Análisis detallado de la cartera de préstamos.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reporte de Morosidad
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes con pagos atrasados y gestión de mora.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reportes;
