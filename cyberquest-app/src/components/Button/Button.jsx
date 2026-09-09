import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

export default function Button({
    children,
    onClick,
    variant = 'primary', // primary | secondary | danger | success | outline | ghost
    size = 'md', // sm | md | lg | xl
    fullWidth = false,
    disabled = false,
    loading = false,
    icon,
    className = '',
    type = 'button',
    sx = {},
    ...props
}) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Map custom sizes to MUI sizes / padding
    const sizeStyles = {
        sm: { py: 0.6, px: 1.5, fontSize: '0.875rem' },
        md: { py: 1, px: 2.2, fontSize: '0.95rem' },
        lg: { py: 1.25, px: 3, fontSize: '1.05rem' },
        xl: { py: 1.5, px: 3.5, fontSize: '1.15rem' },
    }[size] || { py: 1, px: 2.2, fontSize: '0.95rem' };

    // Map custom variants to police theme styles
    let muiVariant = 'contained';
    let variantStyles = {};

    switch (variant) {
        case 'secondary':
            muiVariant = 'contained';
            variantStyles = {
                background: isDark
                    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                    : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                color: isDark ? '#f8fafc' : '#0f172a',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                    background: isDark ? '#334155' : '#94a3b8',
                },
            };
            break;
        case 'danger':
            muiVariant = 'contained';
            variantStyles = {
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: '#ffffff',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                '&:hover': {
                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
                },
            };
            break;
        case 'success':
            muiVariant = 'contained';
            variantStyles = {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                '&:hover': {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                },
            };
            break;
        case 'outline':
            muiVariant = 'outlined';
            variantStyles = {
                borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(11, 41, 114, 0.35)',
                color: isDark ? '#38bdf8' : '#0B2972',
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.05)' : 'rgba(11, 41, 114, 0.04)',
                '&:hover': {
                    borderColor: isDark ? '#38bdf8' : '#0B2972',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(11, 41, 114, 0.08)',
                    boxShadow: isDark
                        ? '0 0 12px rgba(56, 189, 248, 0.25)'
                        : '0 2px 8px rgba(11, 41, 114, 0.15)',
                },
            };
            break;
        case 'ghost':
            muiVariant = 'text';
            variantStyles = {
                color: isDark ? '#94a3b8' : '#475569',
                '&:hover': {
                    color: isDark ? '#38bdf8' : '#0B2972',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(11, 41, 114, 0.06)',
                },
            };
            break;
        case 'primary':
        default:
            muiVariant = 'contained';
            variantStyles = {
                background: isDark
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : 'linear-gradient(135deg, #0B2972 0%, #153E90 100%)',
                color: '#ffffff',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(11, 41, 114, 0.2)',
                boxShadow: isDark
                    ? '0 4px 14px rgba(2, 132, 199, 0.3)'
                    : '0 4px 14px rgba(11, 41, 114, 0.25)',
                '&:hover': {
                    background: isDark
                        ? 'linear-gradient(135deg, #0369a1 0%, #075985 100%)'
                        : 'linear-gradient(135deg, #061e56 0%, #0B2972 100%)',
                    boxShadow: isDark
                        ? '0 0 18px rgba(56, 189, 248, 0.5)'
                        : '0 6px 18px rgba(11, 41, 114, 0.35)',
                },
            };
            break;
    }

    return (
        <MuiButton
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            fullWidth={fullWidth}
            variant={muiVariant}
            className={className}
            sx={{
                fontWeight: 700,
                borderRadius: 2.5,
                fontFamily: "'Assistant', 'Heebo', sans-serif",
                textTransform: 'none',
                gap: 1,
                ...sizeStyles,
                ...variantStyles,
                ...sx,
            }}
            {...props}
        >
            {loading ? (
                <CircularProgress size={20} color="inherit" sx={{ mx: 0.5 }} />
            ) : (
                icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
            )}
            <span>{children}</span>
        </MuiButton>
    );
}
