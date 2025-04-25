import { createTheme } from '@mui/material/styles';

// Science-themed color palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',  // Bright blue - like water or the sky
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#7c4dff',  // Purple - like space/astronomy
      light: '#b47cff',
      dark: '#3f1dcb',
      contrastText: '#fff',
    },
    success: {
      main: '#2e7d32',  // Green - like biology/botany
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ff9800',  // Orange - like chemistry/fire
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',  // Red - like physics energy
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#00bcd4',  // Cyan - like technology/digital
      light: '#4dd0e1',
      dark: '#0097a7',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(25, 118, 210, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 8px rgba(25, 118, 210, 0.3)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default theme;