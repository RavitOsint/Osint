import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { createPoliceTheme } from './policeTheme';

const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

const ThemeContext = createContext({
    mode: 'dark',
    toggleTheme: () => {},
    isDark: true,
});

export const usePoliceTheme = () => useContext(ThemeContext);

export function CustomThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            const saved = localStorage.getItem('police_theme_mode');
            return saved === 'light' ? 'light' : 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('police_theme_mode', mode);
        } catch (e) {
            console.error('Failed to save theme mode to localStorage:', e);
        }
        document.documentElement.setAttribute('data-theme', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const isDark = mode === 'dark';

    const theme = useMemo(() => createPoliceTheme(mode), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, isDark }}>
            <CacheProvider value={cacheRtl}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </CacheProvider>
        </ThemeContext.Provider>
    );
}
