import { useState, useCallback } from 'react';
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
                <div style={{ textAlign: 'center', margin: '2rem 0', padding: '2rem', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>סרטון מצורף</h3>
                    <Button onClick={() => setVideoPlaying(true)} icon="▶️" size="lg" variant="primary">הפעל אנימציה</Button>
                </div>
            );
        }
        return (
            <video
                src={src}
                className="question-image"
                controls
                autoPlay
                style={{ maxHeight: '400px', width: 'auto', display: 'block', margin: '0 auto' }}
            />
        );
    }

    return (
        <img
            src={src}
            alt="Challenge"
            className="question-image"
        />
    );
};

export default function StudentPage() {
    const [studentName, setStudentName] = useState('');
    const [loggedInName, setLoggedInName] = useState('');
    const [phase, setPhase] = useState(PHASES.LOGIN);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState('');

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
            setFeedback('⚠️ זוהתה תשובה שגויה! נועל מערכת...');
            startPenalty();
            return;
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
        <div className="student-page">
            {/* Ambient animated background elements */}
            <div className="ambient-orb orb-1" />
            <div className="ambient-orb orb-2" />
            <div className="ambient-orb orb-3" />

            <div className="student-container">
                <TerminalCard title="cyberquest://terminal">

                    {/* ── LOGIN PHASE ── */}
                    {phase === PHASES.LOGIN && (
                        <div className="phase-content animate-fade-in-up">
                            <div className="student-logo">
                                <img src="/Robot emblem cutout.png" className="logo-image" alt="Logo" />
                                <h1 className="text-gradient">אתגר ענף שיטור דיגיטלי</h1>
                                <p className="student-subtitle">Terminal Access Portal</p>
                            </div>

                            <form onSubmit={handleLogin} className="login-form">
                                <Input
                                    id="student-name-input"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="שם מלא של החניך"
                                    icon="👤"
                                    autoComplete="off"
                                    autoFocus
                                />
                                <Button type="submit" fullWidth size="lg" icon="🔐">
                                    התחברות למערכת
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* ── WAITING PHASE ── */}
                    {phase === PHASES.WAITING && (
                        <div className="phase-content animate-fade-in-up">
                            <div className="waiting-animation">
                                <div className="radar-ring ring-1" />
                                <div className="radar-ring ring-2" />
                                <div className="radar-ring ring-3" />
                                <span className="radar-dot">📡</span>
                            </div>
                            <h2>{settings?.activeCategoryName || 'ממתין לשידור...'}</h2>
                            <p className="waiting-text">המרצה טרם הפעילה את האתגר.</p>
                            <p className="student-name-badge">מחובר כ: <strong>{loggedInName}</strong></p>
                        </div>
                    )}

                    {/* ── CHALLENGE PHASE ── */}
                    {phase === PHASES.CHALLENGE && currentQuestion && (
                        <div className="phase-content animate-fade-in-up" key={currentIndex}>
                            <div className="challenge-header">
                                <span className="challenge-category">{settings?.activeCategoryName}</span>
                                <span className="challenge-progress">
                                    <span className="progress-current">{currentIndex + 1}</span>
                                    <span className="progress-separator">/</span>
                                    <span className="progress-total">{questions.length}</span>
                                </span>
                            </div>

                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                                />
                            </div>

                            <div className="question-area">
                                {currentQuestion.title && (
                                    <h2 className="question-title">{renderTextWithBold(currentQuestion.title)}</h2>
                                )}
                                <p className="question-text">{renderTextWithBold(currentQuestion.text)}</p>
                                {currentQuestion.imageUrl && (
                                    <>
                                        <div className="question-image-container animate-fade-in">
                                            <AnimatedMedia src={currentQuestion.imageUrl} />
                                        </div>
                                        <div className="img-download-area">
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = currentQuestion.imageUrl;
                                                    link.download = `osint_target_${Date.now()}`;
                                                    link.click();
                                                }}
                                                icon="📥"
                                            >
                                                הורדה
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Multiple choice */}
                            {currentQuestion.type === 'multiple' && currentQuestion.options && (
                                <div className="options-grid">
                                    {currentQuestion.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            className="option-card"
                                            onClick={() => handleSubmit(opt)}
                                            disabled={isLocked}
                                        >
                                            <span className="option-letter">{String.fromCharCode(1488 + i)}</span>
                                            <span className="option-text">{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Explanation (No answer needed) */}
                            {currentQuestion.type === 'explanation' && (
                                <div className="explanation-actions">
                                    <Button
                                        onClick={() => handleSubmit('הבנתי')}
                                        fullWidth
                                        disabled={isLocked}
                                        icon="✅"
                                        variant="success"
                                        size="lg"
                                    >
                                        הבנתי / המשך
                                    </Button>
                                </div>
                            )}

                            {/* Open answer */}
                            {currentQuestion.type !== 'multiple' && currentQuestion.type !== 'explanation' && (
                                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="answer-form">
                                    <Input
                                        id="answer-input"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="הקלד תשובה כאן..."
                                        disabled={isLocked}
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    <Button type="submit" fullWidth disabled={isLocked} icon="⚡">
                                        שלח מענה
                                    </Button>
                                </form>
                            )}

                            {/* Feedback & penalty timer */}
                            {isLocked && (
                                <div className="penalty-overlay animate-scale-in">
                                    <div className="penalty-icon">🔒</div>
                                    <p className="penalty-message">{feedback}</p>
                                    <div className="penalty-timer">
                                        <span>{String(timeLeft).padStart(2, '0')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── COMPLETE PHASE ── */}
                    {phase === PHASES.COMPLETE && (
                        <div className="phase-content animate-fade-in-up">
                            <div className="complete-animation">
                                <span className="complete-icon">🏆</span>
                            </div>
                            <h2 className="complete-title" style={{ color: 'var(--success)' }}>
                                MISSION COMPLETE
                            </h2>
                            <p className="complete-text">כל הנתונים הועלו בהצלחה לשרת המרכזי.</p>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="secondary"
                                size="lg"
                                fullWidth
                                icon="🔄"
                            >
                                חזרה להתחלה
                            </Button>
                        </div>
                    )}

                </TerminalCard>
            </div>
        </div>
    );
}
