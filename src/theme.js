import { createTheme } from '@mui/material/styles';

// Tema basado en los colores de Créditos La Unión
const theme = createTheme({
  palette: {
    primary: {
      main: '#00C853', // Verde brillante más suave
      light: '#5FDD9D',
      dark: '#00A344',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C8E6A0', // Verde lima más suave
      light: '#E0F2D0',
      dark: '#A8C67B',
      contrastText: '#2E5016',
    },
    error: {
      main: '#E53935',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#29B6F6',
      light: '#4FC3F7',
      dark: '#0288D1',
    },
    success: {
      main: '#00C853',
      light: '#5FDD9D',
      dark: '#00A344',
    },
    background: {
      default: '#F8F9FA',
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: [
      'Google Sans',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 400,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 400,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 400,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 400,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 400,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '0.0075em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px 0px rgba(0, 200, 83, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
    '0px 3px 6px 0px rgba(0, 200, 83, 0.12), 0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
    '0px 1px 3px 0px rgba(60,64,67,0.3), 0px 4px 8px 3px rgba(60,64,67,0.15)',
    '0px 2px 3px 0px rgba(60,64,67,0.3), 0px 6px 10px 4px rgba(60,64,67,0.15)',
    '0px 4px 4px 0px rgba(60,64,67,0.3), 0px 8px 12px 6px rgba(60,64,67,0.15)',
    '0px 6px 10px 0px rgba(60,64,67,0.3), 0px 1px 18px 0px rgba(60,64,67,0.15)',
    '0px 8px 10px 1px rgba(60,64,67,0.3), 0px 3px 14px 2px rgba(60,64,67,0.15)',
    '0px 9px 12px 1px rgba(60,64,67,0.3), 0px 3px 16px 2px rgba(60,64,67,0.15)',
    '0px 10px 14px 1px rgba(60,64,67,0.3), 0px 4px 18px 3px rgba(60,64,67,0.15)',
    '0px 11px 15px 1px rgba(60,64,67,0.3), 0px 4px 20px 3px rgba(60,64,67,0.15)',
    '0px 12px 17px 2px rgba(60,64,67,0.3), 0px 5px 22px 4px rgba(60,64,67,0.15)',
    '0px 13px 19px 2px rgba(60,64,67,0.3), 0px 5px 24px 4px rgba(60,64,67,0.15)',
    '0px 14px 21px 2px rgba(60,64,67,0.3), 0px 5px 26px 4px rgba(60,64,67,0.15)',
    '0px 15px 22px 2px rgba(60,64,67,0.3), 0px 6px 28px 5px rgba(60,64,67,0.15)',
    '0px 16px 24px 2px rgba(60,64,67,0.3), 0px 6px 30px 5px rgba(60,64,67,0.15)',
    '0px 17px 26px 2px rgba(60,64,67,0.3), 0px 6px 32px 5px rgba(60,64,67,0.15)',
    '0px 18px 28px 2px rgba(60,64,67,0.3), 0px 7px 34px 6px rgba(60,64,67,0.15)',
    '0px 19px 29px 2px rgba(60,64,67,0.3), 0px 7px 36px 6px rgba(60,64,67,0.15)',
    '0px 20px 31px 3px rgba(60,64,67,0.3), 0px 8px 38px 7px rgba(60,64,67,0.15)',
    '0px 21px 33px 3px rgba(60,64,67,0.3), 0px 8px 40px 7px rgba(60,64,67,0.15)',
    '0px 22px 35px 3px rgba(60,64,67,0.3), 0px 8px 42px 7px rgba(60,64,67,0.15)',
    '0px 23px 36px 3px rgba(60,64,67,0.3), 0px 9px 44px 8px rgba(60,64,67,0.15)',
    '0px 24px 38px 3px rgba(60,64,67,0.3), 0px 9px 46px 8px rgba(60,64,67,0.15)',
    '0px 24px 38px 3px rgba(60,64,67,0.3), 0px 9px 46px 8px rgba(60,64,67,0.15)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 28px',
          boxShadow: 'none',
          fontWeight: 500,
          textTransform: 'none',
          fontSize: '0.95rem',
          '&:hover': {
            boxShadow: '0px 2px 4px 0px rgba(0, 200, 83, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px 0px rgba(0, 200, 83, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 4px 12px 0px rgba(0, 200, 83, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00C853',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00C853',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px 0px rgba(0, 200, 83, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
