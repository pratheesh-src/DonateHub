import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#e53935' : '#ff6b6b',
          light: mode === 'light' ? '#ff6f60' : '#ff9a8d',
          dark: mode === 'light' ? '#ab000d' : '#c62828',
        },
        secondary: {
          main: mode === 'light' ? '#2196f3' : '#4fc3f7',
        },
        background: {
          default: mode === 'light' ? '#f5f5f5' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary: mode === 'light' ? '#212121' : '#ffffff',
          secondary: mode === 'light' ? '#666666' : '#b0b0b0',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'light' ? '#ffffff' : '#2d2d2d',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'light' ? '#ffffff' : '#2d2d2d',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: mode === 'light' ? '#e53935' : '#1a1a1a',
              transition: 'background-color 0.3s ease',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease',
            },
          },
        },
      },
    }), [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};