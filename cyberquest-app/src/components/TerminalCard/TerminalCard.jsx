import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SecurityIcon from '@mui/icons-material/Security';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './TerminalCard.css';

export default function TerminalCard({ children, title, className = '', showThemeToggle = true }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Card
            className={`terminal-card ${className}`}
            sx={{
                width: '100%',
                overflow: 'visible',
                backgroundColor: isDark ? 'rgba(11, 23, 46, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isDark
                    ? '1px solid rgba(56, 189, 248, 0.25)'
                    : '1px solid rgba(11, 41, 114, 0.2)',
                boxShadow: isDark
                    ? '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(2, 132, 199, 0.15)'
                    : '0 12px 35px rgba(11, 41, 114, 0.12)',
                borderRadius: 4,
                position: 'relative',
                transition: 'all 0.3s ease',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    borderBottom: '1px solid',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(11, 41, 114, 0.1)',
                    backgroundColor: isDark ? 'rgba(5, 13, 28, 0.7)' : 'rgba(11, 41, 114, 0.04)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mr: 1 }}>
                        <SecurityIcon sx={{ fontSize: '1.1rem', color: isDark ? '#38bdf8' : '#0B2972' }} />
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: "'Fira Code', monospace",
                                fontWeight: 700,
                                color: isDark ? '#38bdf8' : '#0B2972',
                                letterSpacing: '0.05em',
                                direction: 'ltr',
                            }}
                        >
                            {title || 'POLICE-CYBER-TERMINAL://v5.0'}
                        </Typography>
                    </Box>
                </Box>

                {showThemeToggle && (
                    <ThemeToggle size="small" />
                )}
            </Box>

            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                {children}
            </CardContent>
        </Card>
    );
}
