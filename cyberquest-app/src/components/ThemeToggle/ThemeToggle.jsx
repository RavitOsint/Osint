import { IconButton, Tooltip, Box } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { usePoliceTheme } from '../../theme/ThemeContext';

export default function ThemeToggle({ sx = {}, size = 'medium' }) {
    const { mode, toggleTheme, isDark } = usePoliceTheme();

    return (
        <Tooltip title={isDark ? 'מעבר למצב יום (בהיר)' : 'מעבר למצב לילה (משטרתי כהה)'}>
            <IconButton
                onClick={toggleTheme}
                size={size}
                sx={{
                    color: isDark ? '#38bdf8' : '#0B2972',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(11, 41, 114, 0.08)',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(11, 41, 114, 0.2)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(11, 41, 114, 0.15)',
                        borderColor: isDark ? '#38bdf8' : '#0B2972',
                        transform: 'rotate(15deg) scale(1.05)',
                        boxShadow: isDark
                            ? '0 0 12px rgba(56, 189, 248, 0.4)'
                            : '0 2px 8px rgba(11, 41, 114, 0.25)',
                    },
                    ...sx,
                }}
                aria-label="Toggle light/dark mode"
            >
                {isDark ? <LightModeIcon sx={{ fontSize: '1.25rem' }} /> : <DarkModeIcon sx={{ fontSize: '1.25rem' }} />}
            </IconButton>
        </Tooltip>
    );
}
