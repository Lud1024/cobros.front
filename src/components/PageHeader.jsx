import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader - Encabezado de página responsive con breadcrumbs y acciones
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  showHome = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ 
            mb: 1,
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'nowrap',
            },
            '& .MuiBreadcrumbs-li': {
              minWidth: 0,
            },
          }}
        >
          {showHome && (
            <Link
              component="button"
              variant="body2"
              underline="hover"
              color="text.secondary"
              onClick={() => navigate('/app/dashboard')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                p: 0,
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: 18 }} />
              {!isMobile && 'Inicio'}
            </Link>
          )}
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography 
                key={index} 
                variant="body2" 
                color="text.primary"
                fontWeight="medium"
                noWrap
                sx={{ maxWidth: isMobile ? 150 : 'none' }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                component="button"
                variant="body2"
                underline="hover"
                color="text.secondary"
                onClick={() => crumb.path && navigate(crumb.path)}
                sx={{ 
                  cursor: crumb.path ? 'pointer' : 'default',
                  border: 'none',
                  background: 'none',
                  p: 0,
                }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="medium"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              lineHeight: 1.3,
            }}
            noWrap={isMobile}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              '& > *': {
                flex: { xs: '1 1 auto', sm: '0 0 auto' },
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
