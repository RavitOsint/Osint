import { Box, Typography, Button as MuiButton, Divider, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SensorsIcon from '@mui/icons-material/Sensors';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Sidebar.css';

const NAV_ITEMS = [
    { id: 'add-question', label: 'הוספת שאלה', icon: <AddCircleIcon /> },
    { id: 'manage-questions', label: 'ניהול שאלות', icon: <AssignmentIcon /> },
    { id: 'manage-categories', label: 'ניהול קטגוריות', icon: <FolderSpecialIcon /> },
    { id: 'grades', label: 'ציונים והגשות', icon: <AssessmentIcon /> },
    { id: 'broadcast', label: 'שידור חי', icon: <SensorsIcon /> },
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <aside
            className="sidebar"
            role="navigation"
            aria-label="Admin navigation"
            style={{
                backgroundColor: isDark ? '#061022' : '#FFFFFF',
                borderLeft: isDark ? '1px solid rgba(56, 189, 248, 0.15)' : '1px solid rgba(11, 41, 114, 0.12)',
                boxShadow: isDark
                    ? '4px 0 24px rgba(0, 0, 0, 0.4)'
                    : '4px 0 20px rgba(11, 41, 114, 0.06)',
            }}
        >
            <div className="sidebar-header" style={{ borderBottom: isDark ? '1px solid rgba(56, 189, 248, 0.12)' : '1px solid rgba(11, 41, 114, 0.08)', padding: '24px 20px' }}>
                <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative' }}>
                        <img
                            src="/Robot emblem cutout.png"
                            className="sidebar-logo-img"
                            alt="Israel Police Logo"
                            style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain',
                                filter: isDark ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))' : 'drop-shadow(0 2px 6px rgba(11, 41, 114, 0.3))',
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldIcon sx={{ fontSize: '1rem', color: isDark ? '#38bdf8' : '#0B2972' }} />
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: '1.05rem',
                                    lineHeight: 1.2,
                                    color: isDark ? '#F1F5F9' : '#0B2972',
                                    fontFamily: "'Assistant', sans-serif",
                                }}
                            >
                                משטרת ישראל
                            </Typography>
                        </div>
                        <Typography
                            variant="caption"
                            sx={{
                                color: isDark ? '#38bdf8' : '#0288D1',
                                fontWeight: 700,
                                letterSpacing: '0.03em',
                                display: 'block',
                                fontSize: '0.78rem',
                            }}
                        >
                            ענף שיטור דיגיטלי | שליטה
                        </Typography>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            id={`nav-${item.id}`}
                            className={`sidebar-btn ${isActive ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                            aria-current={isActive ? 'page' : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '10px',
                                border: isActive
                                    ? (isDark ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(11, 41, 114, 0.25)')
                                    : '1px solid transparent',
                                background: isActive
                                    ? (isDark
                                        ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.2) 0%, rgba(2, 132, 199, 0.05) 100%)'
                                        : 'linear-gradient(90deg, rgba(11, 41, 114, 0.1) 0%, rgba(11, 41, 114, 0.03) 100%)')
                                    : 'transparent',
                                color: isActive
                                    ? (isDark ? '#38bdf8' : '#0B2972')
                                    : (isDark ? '#94A3B8' : '#475569'),
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'right',
                                fontFamily: "'Assistant', sans-serif",
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.98rem',
                            }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', color: isActive ? (isDark ? '#38bdf8' : '#0B2972') : 'inherit' }}>
                                {item.icon}
                            </span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {isActive && (
                                <Box
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: isDark ? '#38bdf8' : '#0B2972',
                                        boxShadow: isDark ? '0 0 8px #38bdf8' : 'none',
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div
                className="sidebar-footer"
                style={{
                    padding: '16px',
                    borderTop: isDark ? '1px solid rgba(56, 189, 248, 0.12)' : '1px solid rgba(11, 41, 114, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: '#10b981',
                                boxShadow: '0 0 8px #10b981',
                                animation: 'pulse 2s infinite',
                            }}
                        />
                        <Typography variant="caption" sx={{ color: isDark ? '#94A3B8' : '#64748B', fontWeight: 600 }}>
                            עמדת פיקוד פעילה
                        </Typography>
                    </div>

                    <ThemeToggle size="small" />
                </div>

                {onLogout && (
                    <MuiButton
                        onClick={onLogout}
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        sx={{
                            borderRadius: 2,
                            py: 0.8,
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(220, 38, 38, 0.35)',
                            color: isDark ? '#f87171' : '#dc2626',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.06)',
                                borderColor: isDark ? '#ef4444' : '#dc2626',
                            },
                        }}
                    >
                        התנתקות ממערכת
                    </MuiButton>
                )}
            </div>
        </aside>
    );
}
