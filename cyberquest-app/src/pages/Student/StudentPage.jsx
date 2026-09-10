import { useState, useCallback } from 'react';
import { Box, Typography, LinearProgress, Chip, Card, CardActionArea, Alert, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import SensorsIcon from '@mui/icons-material/Sensors';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import TerminalCard from '../../components/TerminalCard/TerminalCard';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import { useStudentSync, usePenaltyTimer } from '../../hooks/useStudentSync';
import { addSubmission } from '../../services/firebase';

import './StudentPage.css';

const PHASES = {
    LOGIN: 'login',
    WAITING: 'waiting',
    CHALLENGE: 'challenge',
    COMPLETE: 'complete',
};

// Helper to render bold text
const renderTextWithBold = (text) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const AnimatedMedia = ({ src }) => {
    const [videoPlaying, setVideoPlaying] = useState(false);
    const isVideo = src.startsWith('data:video');

    if (isVideo) {
        if (!videoPlaying) {
            return (
                <Box
                    sx={{
                        textAlign: 'center',
                        my: 2,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        backgroundColor: 'background.subtle',
                    }}
                >
                    <video
                        src={src}
                        className="question-image"
                        style={{ maxHeight: '280px', width: 'auto', display: 'block', margin: '0 auto 1rem auto', opacity: 0.85, borderRadius: '8px' }}
                        muted
                        playsInline
                    />
                    <Button onClick={() => setVideoPlaying(true)} icon={<PlayArrowIcon />} size="lg" variant="primary">
                        הפעל סרטון חקירה
                    </Button>
                </Box>
            );
        }
        return (
            <video
                src={src}
                className="question-image"
                controls
                autoPlay
                style={{ maxHeight: '380px', width: 'auto', display: 'block', margin: '0 auto', borderRadius: '8px' }}
            />
        );
    }

    return (
        <img
            src={src}
            alt="Police Challenge Media"
            className="question-image"
            style={{ maxHeight: '380px', width: 'auto', display: 'block', margin: '0 auto', borderRadius: '8px' }}
        />
    );
};

export default function StudentPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [studentName, setStudentName] = useState('');
    const [loggedInName, setLoggedInName] = useState('');
    const [phase, setPhase] = useState(PHASES.LOGIN);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);

    const { settings, questions } = useStudentSync(loggedInName);
    const { isLocked, timeLeft, startPenalty } = usePenaltyTimer(10);

    // Transition to challenge when questions arrive
    if (phase === PHASES.WAITING && questions.length > 0) {
        setPhase(PHASES.CHALLENGE);
    }

    const handleLogin = (e) => {
        e.preventDefault();
        if (!studentName.trim()) return;
        setLoggedInName(studentName.trim());
        setPhase(PHASES.WAITING);
    };

    const handleSubmit = useCallback(async (providedValue) => {
        if (isLocked) return;
        const q = questions[currentIndex];
        const val = providedValue || answer.trim();
        if (!val) return;

        const isCorrect = q.answer && val.toLowerCase() === q.answer.toLowerCase();

        // Escape room mode: penalty on wrong flag answers
        if (settings?.gameMode === 'escape' && q.hasFlag && !isCorrect) {
            setFeedback('⚠️ זוהתה תשובה שגויה! נעילת מערכת זמנית מופעלת...');
            startPenalty();
            return;
        }

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Save submission
        await addSubmission({
            student: loggedInName,
            questionText: q.text,
            userAnswer: val,
            hasFlag: q.hasFlag,
            isCorrect: q.hasFlag ? isCorrect : null,
            categoryName: settings?.activeCategoryName || 'ללא קטגוריה',
        });

        setAnswer('');
        setFeedback('');

        if (currentIndex + 1 >= questions.length) {
            setPhase(PHASES.COMPLETE);
        } else {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [isLocked, questions, currentIndex, answer, settings, loggedInName, startPenalty]);

    const currentQuestion = questions[currentIndex];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 4 },
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'background.default',
            }}
        >
            {/* Ambient Background Glows */}
            <Box
                sx={{
                    position: 'fixed',
                    width: 450,
                    height: 450,
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    background: isDark ? 'rgba(2, 132, 199, 0.1)' : 'rgba(11, 41, 114, 0.07)',
                    top: -100,
                    right: -100,
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'fixed',
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    background: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 163, 255, 0.06)',
                    bottom: -50,
                    left: -50,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ width: '100%', maxWidth: 700, position: 'relative', zIndex: 1, mx: 'auto' }}>
                <TerminalCard title="משטרת ישראל // עמדת חקירה מבצעית">

                    {/* ── LOGIN PHASE ── */}
                    {phase === PHASES.LOGIN && (
                        <Box className="animate-fade-in-up" sx={{ textAlign: 'center' }}>
                            <Box sx={{ mb: 3 }}>
                                <img
                                    src="/Robot emblem cutout.png"
                                    alt="Police Emblem"
                                    style={{
                                        width: 130,
                                        height: 130,
                                        objectFit: 'contain',
                                        margin: '0 auto 12px auto',
                                        display: 'block',
                                        filter: isDark ? 'drop-shadow(0 0 20px rgba(56, 189, 248, 0.45))' : 'drop-shadow(0 4px 14px rgba(11, 41, 114, 0.25))',
                                    }}
                                />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 800,
                                        color: isDark ? '#FFFFFF' : '#0B2972',
                                        letterSpacing: '-0.01em',
                                        mb: 0.5,
                                    }}
                                >
                                    אתגר ענף שיטור דיגיטלי
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontFamily: "'Fira Code', monospace",
                                        color: isDark ? '#38bdf8' : '#0288D1',
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    ISRAEL POLICE // CADET ACCESS PORTAL
                                </Typography>
                            </Box>

                            <form onSubmit={handleLogin} style={{ marginTop: '20px' }}>
                                <Input
                                    id="student-name-input"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="הזן שם מלא של החניך / החוקר"
                                    label="שם מלא של החניך"
                                    icon="👤"
                                    autoComplete="off"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    icon={<ShieldIcon sx={{ fontSize: '1.2rem' }} />}
                                    sx={{ mt: 1 }}
                                >
                                    התחברות לאתגר
                                </Button>
                            </form>
                        </Box>
                    )}

                    {/* ── WAITING PHASE ── */}
                    {phase === PHASES.WAITING && (
                        <Box className="animate-fade-in-up" sx={{ textAlign: 'center', py: 2 }}>
                            <Box className="waiting-animation" sx={{ mb: 3 }}>
                                <div className="radar-ring ring-1" style={{ borderColor: isDark ? '#38bdf8' : '#0B2972' }} />
                                <div className="radar-ring ring-2" style={{ borderColor: isDark ? '#38bdf8' : '#0B2972' }} />
                                <div className="radar-ring ring-3" style={{ borderColor: isDark ? '#38bdf8' : '#0B2972' }} />
                                <span className="radar-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SensorsIcon sx={{ color: isDark ? '#38bdf8' : '#0B2972', fontSize: '2rem' }} />
                                </span>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0B2972', mb: 1 }}>
                                {settings?.activeCategoryName || 'ממתין לשידור אתגר...'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 3 }}>
                                המפקד/ת טרם הפעיל/ה את האתגר. המסך יתעדכן אוטומטית ברגע שהשידור יחל.
                            </Typography>

                            <Chip
                                icon={<ShieldIcon sx={{ fontSize: '1rem !important' }} />}
                                label={`מחובר כחוקר: ${loggedInName}`}
                                variant="outlined"
                                color="primary"
                                sx={{ fontWeight: 700, px: 1, py: 2 }}
                            />
                        </Box>
                    )}

                    {/* ── CHALLENGE PHASE ── */}
                    {phase === PHASES.CHALLENGE && currentQuestion && (
                        <Box className="animate-fade-in-up" key={currentIndex}>
                            {/* Header info */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Chip
                                    label={settings?.activeCategoryName || 'אתגר סייבר'}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700 }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: "'Fira Code', monospace",
                                        fontWeight: 800,
                                        color: isDark ? '#38bdf8' : '#0B2972',
                                    }}
                                >
                                    שאלה {currentIndex + 1} מתוך {questions.length}
                                </Typography>
                            </Box>

                            {/* Progress bar */}
                            <LinearProgress
                                variant="determinate"
                                value={((currentIndex) / questions.length) * 100}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    mb: 3,
                                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(11, 41, 114, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: isDark
                                            ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
                                            : 'linear-gradient(90deg, #0B2972 0%, #0288D1 100%)',
                                    },
                                }}
                            />

                            {/* Question content card - centered in layout, text RTL */}
                            <Paper
                                elevation={0}
                                className="police-question-card"
                                style={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    unicodeBidi: 'plaintext',
                                }}
                                sx={{
                                    p: { xs: 2.5, sm: 3.5 },
                                    mb: 3,
                                    borderRadius: 3,
                                    backgroundColor: isDark ? 'rgba(5, 13, 28, 0.6)' : 'rgba(11, 41, 114, 0.03)',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(11, 41, 114, 0.1)',
                                    direction: 'rtl',
                                    textAlign: 'start',
                                    mx: 'auto',
                                    width: '100%',
                                    maxWidth: 680,
                                }}
                            >
                                {currentQuestion.title && (
                                    <Typography
                                        variant="h5"
                                        className="police-rtl-text question-title"
                                        style={{
                                            direction: 'rtl',
                                            textAlign: 'right',
                                            unicodeBidi: 'plaintext',
                                        }}
                                        sx={{
                                            fontWeight: 800,
                                            color: isDark ? '#38bdf8' : '#0B2972',
                                            mb: 1.5,
                                            textAlign: 'start',
                                            direction: 'rtl',
                                            fontFamily: "'Assistant', sans-serif",
                                            unicodeBidi: 'plaintext',
                                            width: '100%',
                                        }}
                                    >
                                        {renderTextWithBold(currentQuestion.title)}
                                    </Typography>
                                )}
                                <Typography
                                    variant="body1"
                                    className="police-rtl-text question-text"
                                    style={{
                                        direction: 'rtl',
                                        textAlign: 'right',
                                        unicodeBidi: 'plaintext',
                                    }}
                                    sx={{
                                        color: isDark ? '#F1F5F9' : '#1E293B',
                                        lineHeight: 1.8,
                                        fontSize: { xs: '1.05rem', sm: '1.2rem' },
                                        whiteSpace: 'pre-line',
                                        textAlign: 'start',
                                        direction: 'rtl',
                                        fontFamily: "'Assistant', sans-serif",
                                        unicodeBidi: 'plaintext',
                                        width: '100%',
                                    }}
                                >
                                    {renderTextWithBold(currentQuestion.text)}
                                </Typography>

                                {currentQuestion.imageUrl && (
                                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <AnimatedMedia src={currentQuestion.imageUrl} />
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                icon={<DownloadIcon sx={{ fontSize: '1.1rem' }} />}
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = currentQuestion.imageUrl;
                                                    link.download = `police_evidence_${Date.now()}`;
                                                    link.click();
                                                }}
                                            >
                                                הורדת מוצג ראייתי (מדיה מלאה)
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {/* Multiple choice options - centered container, RTL items */}
                            {currentQuestion.type === 'multiple' && currentQuestion.options && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, direction: 'rtl', width: '100%', mx: 'auto', maxWidth: 680 }}>
                                    {currentQuestion.options.map((opt, i) => (
                                        <Card
                                            key={i}
                                            sx={{
                                                border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(11, 41, 114, 0.15)',
                                                backgroundColor: isDark ? 'rgba(11, 23, 46, 0.6)' : 'rgba(255, 255, 255, 0.9)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: isDark ? '#38bdf8' : '#0B2972',
                                                    transform: 'translateX(-4px)',
                                                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(11, 41, 114, 0.05)',
                                                },
                                            }}
                                        >
                                            <CardActionArea
                                                onClick={() => handleSubmit(opt)}
                                                disabled={isLocked}
                                                style={{ direction: 'rtl' }}
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    gap: 2,
                                                    direction: 'rtl',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 800,
                                                        fontSize: '1rem',
                                                        backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(11, 41, 114, 0.08)',
                                                        color: isDark ? '#38bdf8' : '#0B2972',
                                                        border: '1px solid',
                                                        borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(11, 41, 114, 0.2)',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {String.fromCharCode(1488 + i)}
                                                </Box>
                                                <Typography
                                                    variant="body1"
                                                    className="police-rtl-text"
                                                    style={{
                                                        direction: 'rtl',
                                                        textAlign: 'right',
                                                        unicodeBidi: 'plaintext',
                                                    }}
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: isDark ? '#F1F5F9' : '#0B2972',
                                                        textAlign: 'start',
                                                        direction: 'rtl',
                                                        flex: 1,
                                                        unicodeBidi: 'plaintext',
                                                    }}
                                                >
                                                    {opt}
                                                </Typography>
                                            </CardActionArea>
                                        </Card>
                                    ))}
                                </Box>
                            )}

                            {/* Explanation (no answer needed) */}
                            {currentQuestion.type === 'explanation' && (
                                <Box sx={{ mt: 2, width: '100%', mx: 'auto', maxWidth: 680 }}>
                                    <Button
                                        onClick={() => handleSubmit('הבנתי')}
                                        fullWidth
                                        disabled={isLocked}
                                        icon={<CheckCircleIcon />}
                                        variant="success"
                                        size="lg"
                                    >
                                        הבנתי, המשך לשלב הבא
                                    </Button>
                                </Box>
                            )}

                            {/* Open Flag Answer */}
                            {currentQuestion.type !== 'multiple' && currentQuestion.type !== 'explanation' && (
                                <Box sx={{ width: '100%', mx: 'auto', maxWidth: 680 }}>
                                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                        <Input
                                            id="answer-input"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            placeholder="הקלד כאן את הפענוח / Flag..."
                                            disabled={isLocked}
                                            autoComplete="off"
                                            autoFocus
                                            label="תשובת החוקר"
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            disabled={isLocked}
                                            icon={<SendIcon sx={{ fontSize: '1.1rem' }} />}
                                            size="lg"
                                            sx={{ mt: 1 }}
                                        >
                                            שליחת מענה לבדיקה
                                        </Button>
                                    </form>
                                </Box>
                            )}

                            {/* Penalty Lockout Overlay */}
                            {isLocked && (
                                <Box
                                    sx={{
                                        position: 'fixed',
                                        inset: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                        backdropFilter: 'blur(10px)',
                                        zIndex: 3000,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 3,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 4,
                                            borderRadius: 4,
                                            backgroundColor: '#0d111d',
                                            border: '2px solid #ef4444',
                                            boxShadow: '0 0 40px rgba(239, 68, 68, 0.5)',
                                            maxWidth: 420,
                                            width: '100%',
                                        }}
                                    >
                                        <LockIcon sx={{ fontSize: '3.5rem', color: '#ef4444', mb: 1, animation: 'pulse 1.5s infinite' }} />
                                        <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800, mb: 1 }}>
                                            נעילת מערכת מבצעית
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#fca5a5', mb: 3 }}>
                                            {feedback || 'זוהה מענה שגוי. המערכת חסומה זמנית.'}
                                        </Typography>
                                        <Typography
                                            variant="h3"
                                            sx={{
                                                fontFamily: "'Fira Code', monospace",
                                                fontWeight: 900,
                                                color: '#ef4444',
                                                letterSpacing: '0.1em',
                                            }}
                                        >
                                            00:{String(timeLeft).padStart(2, '0')}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* ── COMPLETE PHASE ── */}
                    {phase === PHASES.COMPLETE && (
                        <Box className="animate-fade-in-up" sx={{ textAlign: 'center', py: 3 }}>
                            <Box sx={{ mb: 2 }}>
                                <EmojiEventsIcon sx={{ fontSize: '4.5rem', color: '#D4AF37', filter: 'drop-shadow(0 0 16px rgba(212, 175, 55, 0.5))' }} />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981', mb: 1 }}>
                                המשימה הושלמה בהצלחה!
                            </Typography>
                            <Typography variant="body1" sx={{ color: isDark ? '#94A3B8' : '#64748B', mb: 3 }}>
                                כל הממצאים והמענים שודרו ונרשמו בשרתי הפיקוד של משטרת ישראל.
                            </Typography>

                            {settings?.gameMode === 'quiz' && questions.length > 0 && questions.every(q => q.type === 'multiple') && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        my: 3,
                                        p: 3,
                                        borderRadius: 3,
                                        backgroundColor: isDark ? 'rgba(5, 13, 28, 0.6)' : 'rgba(11, 41, 114, 0.05)',
                                        border: '1px solid',
                                        borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(11, 41, 114, 0.15)',
                                    }}
                                >
                                    <Typography variant="h3" sx={{ fontWeight: 900, color: isDark ? '#38bdf8' : '#0B2972', mb: 0.5 }}>
                                        ציון מבצעי: {Math.round((score / questions.length) * 100)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                                        ענית נכונה על {score} מתוך {questions.length} אתגרים
                                    </Typography>
                                </Paper>
                            )}

                            <Button
                                onClick={() => window.location.reload()}
                                variant="primary"
                                size="lg"
                                fullWidth
                                icon={<ReplayIcon />}
                            >
                                חזרה לעמוד הראשי
                            </Button>
                        </Box>
                    )}

                </TerminalCard>
            </Box>
        </Box>
    );
}
