import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
  Refresh,
} from '@mui/icons-material';

/**
 * StatCard - Tarjeta de estadística individual
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  loading = false,
  color = 'primary',
  variant = 'default',
  onClick,
  onRefresh,
  tooltip,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUp fontSize="small" />;
    if (trend < 0) return <TrendingDown fontSize="small" />;
    return <TrendingFlat fontSize="small" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    if (trend > 0) return 'success.main';
    if (trend < 0) return 'error.main';
    return 'text.secondary';
  };

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  const bgColorMap = {
    primary: theme.palette.primary.lighter || `${theme.palette.primary.main}15`,
    secondary: theme.palette.secondary.lighter || `${theme.palette.secondary.main}15`,
    success: theme.palette.success.lighter || `${theme.palette.success.main}15`,
    error: theme.palette.error.lighter || `${theme.palette.error.main}15`,
    warning: theme.palette.warning.lighter || `${theme.palette.warning.main}15`,
    info: theme.palette.info.lighter || `${theme.palette.info.main}15`,
  };

  const cardContent = (
    <Card
      elevation={variant === 'outlined' ? 0 : 1}
      variant={variant === 'outlined' ? 'outlined' : 'elevation'}
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        } : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                {loading ? <Skeleton width={80} /> : title}
              </Typography>
              {tooltip && !loading && (
                <Tooltip title={tooltip} arrow placement="top">
                  <Info fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }} />
                </Tooltip>
              )}
            </Box>
            
            <Typography 
              variant="h4" 
              component="div"
              sx={{ 
                fontWeight: 700,
                color: colorMap[color] || color,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                lineHeight: 1.2,
              }}
            >
              {loading ? <Skeleton width={100} height={40} /> : value}
            </Typography>

            {(subtitle || trend !== undefined) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {trend !== undefined && !loading && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.25,
                      color: getTrendColor(),
                    }}
                  >
                    {getTrendIcon()}
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {Math.abs(trend)}%
                    </Typography>
                  </Box>
                )}
                {subtitle && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  >
                    {loading ? <Skeleton width={60} /> : (trendLabel || subtitle)}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            {Icon && (
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: bgColorMap[color] || `${color}15`,
                  color: colorMap[color] || color,
                }}
              >
                {loading ? (
                  <Skeleton variant="circular" width={24} height={24} />
                ) : (
                  <Icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                )}
              </Box>
            )}
            {onRefresh && !loading && (
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                sx={{ mt: 0.5 }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return cardContent;
};

/**
 * StatCardGrid - Grid de tarjetas de estadísticas
 */
export const StatCardGrid = ({ stats = [], loading = false, columns = { xs: 1, sm: 2, md: 4 } }) => {
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12 / columns.xs} sm={12 / columns.sm} md={12 / columns.md} key={stat.id || index}>
          <StatCard {...stat} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * MiniStat - Estadística compacta en línea
 */
export const MiniStat = ({ label, value, color = 'primary', loading = false, sx = {} }) => {
  const theme = useTheme();
  
  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 4,
          height: 32,
          borderRadius: 1,
          bgcolor: colorMap[color] || color,
        }}
      />
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {loading ? <Skeleton width={40} /> : label}
        </Typography>
        <Typography variant="subtitle2" fontWeight={600}>
          {loading ? <Skeleton width={60} /> : value}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * ProgressStat - Estadística con barra de progreso
 */
export const ProgressStat = ({ 
  label, 
  value, 
  max, 
  color = 'primary', 
  showPercentage = true,
  loading = false,
  sx = {} 
}) => {
  const theme = useTheme();
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? <Skeleton width={60} /> : label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {loading ? (
            <Skeleton width={40} />
          ) : (
            showPercentage ? `${percentage}%` : `${value}/${max}`
          )}
        </Typography>
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1 }} />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: 8,
            borderRadius: 1,
            bgcolor: 'grey.200',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${percentage}%`,
              height: '100%',
              borderRadius: 1,
              bgcolor: colorMap[color] || color,
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default {
  StatCard,
  StatCardGrid,
  MiniStat,
  ProgressStat,
};
