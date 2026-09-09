import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, Container, Typography, Card, CardActionArea, Grid, Chip, AppBar, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldIcon from '@mui/icons-material/Shield';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BoltIcon from '@mui/icons-material/Bolt';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import StudentPage from './pages/Student/StudentPage';
import AdminPage from './pages/Admin/AdminPage';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

import './App.css';

function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
      }}
    >
      {/* Ambient background glows with Israeli police blue tone */}
      <Box
        sx={{
          position: 'fixed',
          width: 550,
          height: 550,
          borderRadius: '50%',
          filter: 'blur(120px)',
          background: isDark ? 'rgba(2, 132, 199, 0.12)' : 'rgba(11, 41, 114, 0.08)',
          top: -150,
          right: -100,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          width: 450,
          height: 450,
          borderRadius: '50%',
          filter: 'blur(120px)',
          background: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 163, 255, 0.06)',
          bottom: -100,
          left: -100,
          pointerEvents: 'none',
        }}
      />

      {/* Top Police Department Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(11, 41, 114, 0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img
              src="/Robot emblem cutout.png"
              alt="Police Emblem"
              style={{
                width: 38,
                height: 38,
                objectFit: 'contain',
                filter: isDark ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' : 'none',
              }}
            />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  lineHeight: 1.1,
                  color: isDark ? '#F1F5F9' : '#0B2972',
                }}
              >
                משטרת ישראל
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#38bdf8' : '#0288D1',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                ענף שיטור דיגיטלי
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '1rem !important', color: isDark ? '#38bdf8' : '#0B2972' }} />}
              label="מערכת מבצעית מוגנת"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(11, 41, 114, 0.06)',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(11, 41, 114, 0.15)',
                borderWidth: 1,
                borderStyle: 'solid',
                color: isDark ? '#F1F5F9' : '#0B2972',
                fontWeight: 600,
              }}
            />
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Emblem */}
        <Box sx={{ position: 'relative', mb: 3 }}>
          <img
            src="/Robot emblem cutout.png"
            className="landing-logo"
            alt="Police Emblem"
            style={{
              width: 170,
              height: 170,
              objectFit: 'contain',
              margin: '0 auto',
              filter: isDark
                ? 'drop-shadow(0 0 35px rgba(2, 132, 199, 0.5)) drop-shadow(0 0 70px rgba(56, 189, 248, 0.2))'
                : 'drop-shadow(0 12px 28px rgba(11, 41, 114, 0.25))',
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: '2.2rem', sm: '3.2rem' },
            letterSpacing: '-0.02em',
            mb: 1.5,
            color: isDark ? '#FFFFFF' : '#0B2972',
            textShadow: isDark ? '0 0 30px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          אתגר ענף שיטור דיגיטלי
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontSize: { xs: '1.05rem', sm: '1.25rem' },
            fontWeight: 600,
            color: isDark ? '#94A3B8' : '#334155',
            maxWidth: 620,
            mb: 1,
          }}
        >
          פלטפורמת אתגרי סייבר, חקירות ומודיעין גלוי (OSINT)
        </Typography>

        <Typography
          variant="body2"
          sx={{
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.88rem',
            color: isDark ? '#38bdf8' : '#0288D1',
            letterSpacing: '0.04em',
            mb: 5,
          }}
        >
          [ISRAEL POLICE // CYBER & OSINT COMMAND v5.0]
        </Typography>

        {/* Portals Grid */}
        <Grid container spacing={3} sx={{ maxWidth: 760, width: '100%', mb: 5 }}>
          {/* Student Entrance */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: isDark ? 'rgba(11, 23, 46, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(11, 41, 114, 0.15)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: isDark ? '#38bdf8' : '#0B2972',
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(2, 132, 199, 0.25)'
                    : '0 12px 30px rgba(11, 41, 114, 0.15)',
                },
              }}
            >
              <CardActionArea
                component={Link}
                to="/student"
                id="nav-student"
                sx={{
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(11, 41, 114, 0.08)',
                    color: isDark ? '#38bdf8' : '#0B2972',
                    mb: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(11, 41, 114, 0.15)',
                  }}
                >
                  <SchoolIcon sx={{ fontSize: '2rem' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: isDark ? '#F1F5F9' : '#0B2972' }}>
                  כניסת חניכים
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 2 }}>
                  התחברות לאתגרים, פענוח מודיעין ומענה בזמן אמת
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isDark ? '#38bdf8' : '#0B2972', fontWeight: 700 }}>
                  <span>כניסה לטרמינל</span>
                  <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Admin / Instructor Portal */}
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: isDark ? 'rgba(11, 23, 46, 0.75)' : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(11, 41, 114, 0.15)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: isDark ? '#38bdf8' : '#0B2972',
                  transform: 'translateY(-4px)',
                  boxShadow: isDark
                    ? '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(2, 132, 199, 0.25)'
                    : '0 12px 30px rgba(11, 41, 114, 0.15)',
                },
              }}
            >
              <CardActionArea
                component={Link}
                to="/admin"
                id="nav-admin"
                sx={{
                  p: 3.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? 'rgba(0, 163, 255, 0.12)' : 'rgba(2, 136, 209, 0.08)',
                    color: isDark ? '#00A3FF' : '#0288D1',
                    mb: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(0, 163, 255, 0.25)' : 'rgba(2, 136, 209, 0.15)',
                  }}
                >
                  <AdminPanelSettingsIcon sx={{ fontSize: '2rem' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: isDark ? '#F1F5F9' : '#0B2972' }}>
                  פורטל מפקד ומדריך
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 2 }}>
                  ניהול שאלות, קטגוריות, ציונים ושידור חי לחניכים
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isDark ? '#00A3FF' : '#0288D1', fontWeight: 700 }}>
                  <span>כניסה לשליטה</span>
                  <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* Stats / Badges */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <Chip
            icon={<VerifiedUserIcon sx={{ fontSize: '1rem !important' }} />}
            label="תקן סייבר משטרתי"
            variant="outlined"
            size="medium"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<BoltIcon sx={{ fontSize: '1rem !important' }} />}
            label="סנכרון מיידי בזמן אמת"
            variant="outlined"
            size="medium"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<CloudDoneIcon sx={{ fontSize: '1rem !important' }} />}
            label="Firebase Cloud Engine"
            variant="outlined"
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
