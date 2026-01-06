import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { MoreVert, Info } from '@mui/icons-material';

/**
 * ResponsiveTable - Tabla que se adapta a dispositivos móviles
 * En móvil muestra una vista de tarjetas en lugar de tabla tradicional
 */
const ResponsiveTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No se encontraron registros',
  onRowClick,
  rowKey = 'id',
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  showActions = true,
  renderActions,
  mobileCardConfig = {},
  stickyHeader = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Configuración por defecto para tarjetas móviles
  const {
    titleKey = columns[0]?.key,
    subtitleKey = columns[1]?.key,
    chipKey,
    chipColor,
  } = mobileCardConfig;

  // Renderizar skeleton de carga
  const renderSkeleton = () => {
    if (isMobile) {
      return Array(3).fill(0).map((_, index) => (
        <Card key={index} sx={{ mb: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
          </CardContent>
        </Card>
      ));
    }

    return Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        {columns.map((col, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
        {showActions && (
          <TableCell>
            <Skeleton variant="circular" width={32} height={32} />
          </TableCell>
        )}
      </TableRow>
    ));
  };

  // Renderizar vista móvil (tarjetas)
  const renderMobileView = () => {
    if (loading) return renderSkeleton();

    if (!data || data.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Box>
      );
    }

    return data.map((row, index) => {
      const title = titleKey ? row[titleKey] : `Registro ${index + 1}`;
      const subtitle = subtitleKey ? row[subtitleKey] : null;
      const chipValue = chipKey ? row[chipKey] : null;

      return (
        <Card 
          key={row[rowKey] || index} 
          sx={{ 
            mb: 1.5,
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            '&:hover': onRowClick ? {
              transform: 'translateY(-1px)',
              boxShadow: 2,
            } : {},
            '&:active': onRowClick ? {
              transform: 'translateY(0)',
            } : {},
          }}
          onClick={() => onRowClick && onRowClick(row)}
        >
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight="medium" noWrap>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {chipValue && (
                <Chip 
                  label={chipValue} 
                  size="small" 
                  color={typeof chipColor === 'function' ? chipColor(chipValue) : chipColor || 'default'}
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
            </Box>
            
            {/* Mostrar campos adicionales visibles en móvil */}
            <Box sx={{ mt: 1 }}>
              {columns.filter(col => col.showOnMobile && col.key !== titleKey && col.key !== subtitleKey && col.key !== chipKey).map((col, colIndex) => (
                <Box key={colIndex} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    {col.label}:
                  </Typography>
                  <Typography variant="caption" fontWeight="medium">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Acciones */}
            {showActions && renderActions && (
              <>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                  {renderActions(row)}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      );
    });
  };

  // Renderizar vista desktop (tabla tradicional)
  const renderDesktopView = () => {
    return (
      <TableContainer 
        component={Paper} 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        <Table size="small" stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                    whiteSpace: 'nowrap',
                    display: col.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : 'table-cell',
                    ...col.headerSx,
                  }}
                  align={col.align || 'left'}
                >
                  {col.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell 
                  sx={{ color: 'white', fontWeight: 600, bgcolor: 'primary.main' }} 
                  align="center"
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showActions ? 1 : 0)} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={row[rowKey] || rowIndex} 
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      sx={{
                        display: col.hideOnMobile ? { xs: 'none', sm: 'table-cell' } : 'table-cell',
                        ...col.cellSx,
                      }}
                      align={col.align || 'left'}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="center">
                      {renderActions ? renderActions(row) : null}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {pagination && (
          <TablePagination
            component="div"
            count={totalCount || data?.length || 0}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
              '.MuiTablePagination-select': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          />
        )}
      </TableContainer>
    );
  };

  // Renderizar según el tamaño de pantalla
  if (isMobile) {
    return (
      <Box>
        {renderMobileView()}
        {pagination && data && data.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              component="div"
              count={totalCount || data.length}
              page={page}
              onPageChange={onPageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage=""
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{
                '.MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  px: 0,
                },
                '.MuiTablePagination-selectLabel': {
                  display: 'none',
                },
                '.MuiTablePagination-displayedRows': {
                  fontSize: '0.75rem',
                },
              }}
            />
          </Box>
        )}
      </Box>
    );
  }

  return renderDesktopView();
};

export default ResponsiveTable;
