import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
  ClickAwayListener,
  Chip,
} from '@mui/material';
import { Search, Clear, FilterList, History } from '@mui/icons-material';

/**
 * SearchInput - Campo de búsqueda mejorado con historial y sugerencias
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  onSearch,
  showClear = true,
  showHistory = false,
  historyKey = 'search_history',
  maxHistoryItems = 5,
  filters = [],
  activeFilters = [],
  onFilterChange,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  autoFocus = false,
  debounceMs = 300,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [localValue, setLocalValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Cargar historial del localStorage
  useEffect(() => {
    if (showHistory) {
      try {
        const saved = localStorage.getItem(historyKey);
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, [showHistory, historyKey]);

  // Sincronizar con valor externo
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounce onChange
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onChange && localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, debounceMs]);

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    if (onChange) onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && localValue.trim()) {
      // Guardar en historial
      if (showHistory) {
        const newHistory = [localValue, ...history.filter(h => h !== localValue)].slice(0, maxHistoryItems);
        setHistory(newHistory);
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
      }
      if (onSearch) onSearch(localValue);
      setShowSuggestions(false);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleHistoryClick = (term) => {
    setLocalValue(term);
    if (onChange) onChange(term);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(historyKey);
  };

  return (
    <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
      <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto', ...sx }}>
        <TextField
          inputRef={inputRef}
          fullWidth={fullWidth}
          size={isMobile ? 'small' : size}
          variant={variant}
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => showHistory && history.length > 0 && setShowSuggestions(true)}
          autoFocus={autoFocus}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {showClear && localValue && (
                  <IconButton 
                    size="small" 
                    onClick={handleClear}
                    edge="end"
                    aria-label="Limpiar búsqueda"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
            sx: {
              '& input': {
                fontSize: { xs: '16px', sm: '0.875rem' },
              },
            },
          }}
        />

        {/* Filtros activos */}
        {filters.length > 0 && activeFilters.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {activeFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={filter.label}
                size="small"
                onDelete={() => onFilterChange && onFilterChange(activeFilters.filter(f => f.id !== filter.id))}
                color="primary"
                variant="outlined"
              />
            ))}
            {activeFilters.length > 0 && (
              <Chip
                label="Limpiar todo"
                size="small"
                onClick={() => onFilterChange && onFilterChange([])}
                color="default"
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>
        )}

        {/* Historial de búsqueda */}
        <Fade in={showSuggestions && history.length > 0}>
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1000,
              maxHeight: 250,
              overflow: 'auto',
            }}
          >
            <Box sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <History fontSize="small" />
                  Búsquedas recientes
                </Typography>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={clearHistory}
                >
                  Limpiar
                </Typography>
              </Box>
              {history.map((term, index) => (
                <Box
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  sx={{
                    py: 0.75,
                    px: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Search fontSize="small" color="action" />
                  <Typography variant="body2">{term}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchInput;
