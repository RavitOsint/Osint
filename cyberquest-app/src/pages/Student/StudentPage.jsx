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
            setFeedback('⚠️ זוהתה פריצה לא מורשית! נועל מערכת...');
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
                                <span className="logo-symbol">⟁</span>
                                <h1 className="text-gradient">CyberQuest</h1>
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
                                <p className="question-text">{currentQuestion.text}</p>
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

                            {/* Open answer */}
                            {currentQuestion.type !== 'multiple' && (
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
                                        שלח פקודה
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
