import { createTheme } from '@mui/material/styles';

/**
 * Israel Police (משטרת ישראל - ענף שיטור דיגיטלי) Custom Theme
 * Deep authoritative Navy Blue, Tactical Cyan accents, Insignia Gold, and Siren Red alerts.
 */
export const createPoliceTheme = (mode = 'dark') => {
    const isDark = mode === 'dark';

    return createTheme({
        direction: 'rtl',
        palette: {
            mode,
            primary: {
                main: isDark ? '#38bdf8' : '#0B2972',
                light: isDark ? '#7dd3fc' : '#1D4ED8',
                dark: isDark ? '#0284c7' : '#061748',
                contrastText: isDark ? '#061022' : '#ffffff',
            },
            secondary: {
                main: '#00A3FF',
                light: '#60C2FF',
                dark: '#0077BA',
                contrastText: '#ffffff',
            },
            policeGold: {
                main: '#D4AF37',
                light: '#F5D061',
                dark: '#A68417',
                contrastText: '#061022',
            },
            background: {
                default: isDark ? '#050D1C' : '#F1F5F9',
                paper: isDark ? '#0B172E' : '#FFFFFF',
                elevated: isDark ? '#102040' : '#F8FAFC',
                subtle: isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(11, 41, 114, 0.04)',
            },
            text: {
                primary: isDark ? '#F1F5F9' : '#0A1931',
                secondary: isDark ? '#94A3B8' : '#475569',
                disabled: isDark ? '#64748B' : '#94A3B8',
            },
            error: {
                main: '#D32F2F',
                light: '#EF5350',
                dark: '#C62828',
            },
            warning: {
                main: '#F59E0B',
                light: '#FBBF24',
                dark: '#D97706',
            },
            info: {
                main: '#0288D1',
                light: '#29B6F6',
                dark: '#01579B',
            },
            success: {
                main: '#10B981',
                light: '#34D399',
                dark: '#059669',
            },
            divider: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(11, 41, 114, 0.1)',
        },
        typography: {
            fontFamily: "'Assistant', 'Heebo', 'Rubik', 'Inter', sans-serif",
            h1: {
                fontWeight: 800,
                letterSpacing: '-0.02em',
            },
            h2: {
                fontWeight: 800,
                letterSpacing: '-0.01em',
            },
            h3: {
                fontWeight: 700,
            },
            h4: {
                fontWeight: 700,
            },
            h5: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
            button: {
                fontWeight: 700,
                textTransform: 'none',
                letterSpacing: '0.02em',
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        scrollbarColor: isDark ? '#1E3A68 #050D1C' : '#CBD5E1 #F1F5F9',
                        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                        },
                        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                            borderRadius: 8,
                            backgroundColor: isDark ? '#1E3A68' : '#94A3B8',
                        },
                        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
                            backgroundColor: isDark ? '#050D1C' : '#F1F5F9',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        padding: '8px 20px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: isDark
                                ? '0 0 16px rgba(56, 189, 248, 0.35)'
                                : '0 4px 12px rgba(11, 41, 114, 0.2)',
                            transform: 'translateY(-1px)',
                        },
                    },
                    containedPrimary: {
                        background: isDark
                            ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                            : 'linear-gradient(135deg, #0B2972 0%, #153E90 100%)',
                        color: '#ffffff',
                        border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                    },
                    containedSecondary: {
                        background: 'linear-gradient(135deg, #00A3FF 0%, #0077BA 100%)',
                        color: '#ffffff',
                    },
                    outlined: {
                        borderWidth: 1.5,
                        borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(11, 41, 114, 0.25)',
                        '&:hover': {
                            borderWidth: 1.5,
                            borderColor: isDark ? '#38bdf8' : '#0B2972',
                            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(11, 41, 114, 0.05)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        backgroundImage: 'none',
                        border: isDark
                            ? '1px solid rgba(56, 189, 248, 0.15)'
                            : '1px solid rgba(11, 41, 114, 0.12)',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                            : '0 8px 24px rgba(11, 41, 114, 0.08)',
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        backgroundColor: isDark ? 'rgba(5, 13, 28, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(11, 41, 114, 0.18)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? '#38bdf8' : '#0B2972',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? '#38bdf8' : '#0B2972',
                            borderWidth: 2,
                            boxShadow: isDark ? '0 0 12px rgba(56, 189, 248, 0.25)' : '0 0 8px rgba(11, 41, 114, 0.2)',
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                        borderRadius: 8,
                    },
                },
            },
        },
    });
};
