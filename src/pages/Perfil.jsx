import { Box, Card, CardContent, Typography, Avatar, Grid, Divider } from '@mui/material';
import { Email, Phone, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Perfil = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Mi Perfil
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3,
              }}
            >
              {user?.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user?.usuario}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Usuario
                  </Typography>
                  <Typography variant="body1">{user?.usuario}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body1">{user?.correo}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Perfil;
