import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import Input, { Textarea, Select } from '../../components/Input/Input';
import {
    getCategories, addCategory, deleteCategory,
    getQuestions, addQuestion, updateQuestion, deleteQuestion,
    getSubmissions, markSubmission,
    updateSettings,
} from '../../services/firebase';
import './AdminPage.css';

const ADMIN_PASSWORD = 'zigi2026';

export default function AdminPage() {
    // Auth
    const [isAuthed, setIsAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Data
    const [categories, setCategories] = useState({});
    const [questions, setQuestions] = useState({});
    const [submissions, setSubmissions] = useState({});

    // UI state
    const [activeTab, setActiveTab] = useState('add-question');
    const [loading, setLoading] = useState(false);

    // Add question form
    const [newQ, setNewQ] = useState({
        text: '', type: 'open', answer: '', hasFlag: true, categoryIds: [], options: ['', '', ''],
        correctOptionIndex: 0,
    });

    // Edit question
    const [editQ, setEditQ] = useState(null);
    const [editId, setEditId] = useState(null);

    // Categories
    const [newCatName, setNewCatName] = useState('');
    const [viewCatId, setViewCatId] = useState(null);

    // Grades
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Broadcast
    const [broadcastCatId, setBroadcastCatId] = useState('');
    const [gameMode, setGameMode] = useState('quiz');

    // ── Auth ────────────────────────────────────────────────
    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthed(true);
            setAuthError('');
        } else {
            setAuthError('גישה נדחתה - סיסמה שגויה');
        }
    };

    // ── Data fetching ──────────────────────────────────────
    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const [cats, qs] = await Promise.all([getCategories(), getQuestions()]);
            setCategories(cats);
            setQuestions(qs);
            if (!broadcastCatId && Object.keys(cats).length > 0) {
                setBroadcastCatId(Object.keys(cats)[0]);
            }
        } catch (err) {
            console.error('Failed to refresh data:', err);
        } finally {
            setLoading(false);
        }
    }, [broadcastCatId]);

    useEffect(() => {
        if (isAuthed) refreshData();
    }, [isAuthed, refreshData]);

    const loadSubmissions = useCallback(async () => {
        const subs = await getSubmissions();
        setSubmissions(subs);
    }, []);

    // ── Tab change ─────────────────────────────────────────
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setEditQ(null);
        setEditId(null);
        setViewCatId(null);
        setSelectedStudent(null);
        if (tab === 'grades') loadSubmissions();
    };

    // ── Add Question ────────────────────────────────────────
    const handleAddQuestion = async () => {
        let questionData = {
            text: newQ.text,
            type: newQ.type,
            hasFlag: newQ.hasFlag,
            categoryIds: newQ.categoryIds,
            answer: '',
            options: null,
        };

        if (newQ.type === 'multiple') {
            const validOpts = newQ.options.filter((o) => o.trim());
            questionData.options = validOpts;
            questionData.answer = validOpts[newQ.correctOptionIndex] || '';
            questionData.hasFlag = true;
        } else {
            questionData.answer = newQ.hasFlag ? newQ.answer : '';
        }

        await addQuestion(questionData);
        setNewQ({ text: '', type: 'open', answer: '', hasFlag: true, categoryIds: [], options: ['', '', ''], correctOptionIndex: 0 });
        await refreshData();
        setActiveTab('manage-questions');
    };

    // ── Edit Question ───────────────────────────────────────
    const openEditQuestion = (id) => {
        const q = questions[id];
        setEditId(id);
        setEditQ({
            ...q,
            categoryIds: q.categoryIds || [],
            options: q.options || ['', '', ''],
            correctOptionIndex: q.options ? q.options.indexOf(q.answer) : 0,
        });
        setActiveTab('edit-question');
    };

    const handleUpdateQuestion = async () => {
        let updated = { ...editQ };
        if (updated.type === 'multiple') {
            const validOpts = updated.options.filter((o) => o.trim());
            updated.options = validOpts;
            updated.answer = validOpts[updated.correctOptionIndex] || '';
            updated.hasFlag = true;
        } else {
            updated.answer = updated.hasFlag ? updated.answer : '';
            updated.options = null;
        }
        delete updated.correctOptionIndex;
        await updateQuestion(editId, updated);
        await refreshData();
        setActiveTab('manage-questions');
        setEditQ(null);
        setEditId(null);
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm('למחוק שאלה זו?')) {
            await deleteQuestion(id);
            await refreshData();
        }
    };

    // ── Categories ──────────────────────────────────────────
    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        await addCategory(newCatName.trim());
        setNewCatName('');
        await refreshData();
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('למחוק קטגוריה זו?')) {
            await deleteCategory(id);
            await refreshData();
        }
    };

    // ── Grading ─────────────────────────────────────────────
    const handleMarkSubmission = async (subId, isCorrect) => {
        await markSubmission(subId, isCorrect);
        await loadSubmissions();
    };

    const studentNames = [...new Set(Object.values(submissions).map((s) => s.student))];

    // ── Broadcast ───────────────────────────────────────────
    const handleBroadcast = async () => {
        if (!broadcastCatId) return alert('בחר קטגוריה תחילה');
        await updateSettings({
            gameMode,
            activeCategoryId: broadcastCatId,
            activeCategoryName: categories[broadcastCatId]?.name || '',
        });
        alert('השידור הופעל! החניכים יכולים להתחיל.');
    };

    // ── Category checkbox toggle ────────────────────────────
    const toggleCategory = (catId, target) => {
        if (target === 'new') {
            setNewQ((prev) => ({
                ...prev,
                categoryIds: prev.categoryIds.includes(catId)
                    ? prev.categoryIds.filter((id) => id !== catId)
                    : [...prev.categoryIds, catId],
            }));
        } else {
            setEditQ((prev) => ({
                ...prev,
                categoryIds: prev.categoryIds.includes(catId)
                    ? prev.categoryIds.filter((id) => id !== catId)
                    : [...prev.categoryIds, catId],
            }));
        }
    };

    // ── Category options for select ─────────────────────────
    const categoryOptions = Object.entries(categories).map(([id, cat]) => ({
        value: id,
        label: cat.name,
    }));

    // ══════════════════════════════════════════════════════════
    // LOGIN OVERLAY
    // ══════════════════════════════════════════════════════════
    if (!isAuthed) {
        return (
            <div className="admin-login-overlay">
                <div className="ambient-orb orb-admin-1" />
                <div className="ambient-orb orb-admin-2" />
                <div className="admin-login-card animate-scale-in">
                    <div className="login-card-glow" />
                    <span className="admin-login-icon">⟁</span>
                    <h1 className="text-gradient">CYBERQUEST</h1>
                    <p className="admin-login-subtitle">ADMINISTRATION SYSTEM v5.0</p>
                    <form onSubmit={handleLogin} className="admin-login-form">
                        <Input
                            id="admin-password-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="הכנס סיסמת מנהל"
                            error={authError}
                            icon="🔑"
                            autoFocus
                        />
                        <Button type="submit" fullWidth size="xl">
                            כניסה למערכת
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════
    // ADMIN PANEL
    // ══════════════════════════════════════════════════════════
    return (
        <div className="admin-layout">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

            <main className="admin-main">
                {/* ── ADD QUESTION TAB ── */}
                {activeTab === 'add-question' && (
                    <div className="admin-card animate-fade-in" id="tab-add-question">
                        <h3 className="card-title">
                            <span className="card-title-icon">➕</span>
                            יצירת שאלה חדשה
                        </h3>

                        <div className="form-section">
                            <label className="section-label">שיוך לקטגוריות:</label>
                            <div className="cat-checkboxes">
                                {Object.entries(categories).map(([id, cat]) => (
                                    <label key={id} className={`cat-checkbox ${newQ.categoryIds.includes(id) ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={newQ.categoryIds.includes(id)}
                                            onChange={() => toggleCategory(id, 'new')}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <Select
                                id="question-type-select"
                                label="סוג המענה:"
                                value={newQ.type}
                                onChange={(e) => setNewQ((p) => ({ ...p, type: e.target.value }))}
                                options={[
                                    { value: 'open', label: 'שאלה פתוחה (Flag)' },
                                    { value: 'multiple', label: 'שאלה אמריקאית (בחירה)' },
                                ]}
                            />
                            <div className="checkbox-field">
                                <label className="custom-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={newQ.hasFlag}
                                        onChange={(e) => setNewQ((p) => ({ ...p, hasFlag: e.target.checked }))}
                                    />
                                    <span className="checkmark" />
                                    <span>בדיקה אוטומטית ע&quot;י המערכת</span>
                                </label>
                            </div>
                        </div>

                        <Textarea
                            id="question-text-input"
                            label="תוכן השאלה / האתגר:"
                            value={newQ.text}
                            onChange={(e) => setNewQ((p) => ({ ...p, text: e.target.value }))}
                            placeholder="הקלד כאן את השאלה..."
                            rows={6}
                        />

                        {newQ.type === 'open' && newQ.hasFlag && (
                            <Input
                                id="question-answer-input"
                                label="התשובה הנכונה (Flag):"
                                value={newQ.answer}
                                onChange={(e) => setNewQ((p) => ({ ...p, answer: e.target.value }))}
                                placeholder="הזן את ה-Flag המדויק"
                            />
                        )}

                        {newQ.type === 'multiple' && (
                            <div className="form-section">
                                <label className="section-label">אפשרויות תשובה (סמן את הנכונה):</label>
                                <div className="options-list">
                                    {newQ.options.map((opt, i) => (
                                        <div key={i} className="option-row">
                                            <input
                                                type="radio"
                                                name="newCorrect"
                                                checked={newQ.correctOptionIndex === i}
                                                onChange={() => setNewQ((p) => ({ ...p, correctOptionIndex: i }))}
                                                className="option-radio"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...newQ.options];
                                                    newOpts[i] = e.target.value;
                                                    setNewQ((p) => ({ ...p, options: newOpts }));
                                                }}
                                                placeholder="הזן תשובה אפשרית"
                                                className="option-input"
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setNewQ((p) => ({ ...p, options: [...p.options, ''] }))}
                                    >
                                        + הוסף תשובה אפשרית
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Button onClick={handleAddQuestion} variant="success" fullWidth size="xl" className="mt-xl">
                            שמור שאלה במאגר
                        </Button>
                    </div>
                )}

                {/* ── MANAGE QUESTIONS TAB ── */}
                {activeTab === 'manage-questions' && (
                    <div className="admin-card animate-fade-in" id="tab-manage-questions">
                        <h3 className="card-title">
                            <span className="card-title-icon">📝</span>
                            ניהול מאגר השאלות
                            <span className="card-title-badge">{Object.keys(questions).length}</span>
                        </h3>

                        <div className="items-list">
                            {Object.entries(questions).map(([id, q], index) => (
                                <div key={id} className="list-item animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="item-info">
                                        <span className="item-number">{index + 1}</span>
                                        <div className="item-details">
                                            <span className="item-text">{q.text.substring(0, 120)}{q.text.length > 120 ? '...' : ''}</span>
                                            <div className="item-meta">
                                                <span className="tag tag-type">{q.type === 'multiple' ? 'אמריקאית' : 'פתוחה'}</span>
                                                {q.hasFlag && <span className="tag tag-flag">🚩 Flag</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <Button variant="outline" size="sm" onClick={() => openEditQuestion(id)}>עריכה</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteQuestion(id)}>מחיקה</Button>
                                    </div>
                                </div>
                            ))}

                            {Object.keys(questions).length === 0 && (
                                <div className="empty-state">
                                    <span className="empty-icon">📭</span>
                                    <p>אין שאלות במאגר עדיין</p>
                                    <Button variant="outline" onClick={() => setActiveTab('add-question')}>הוסף שאלה ראשונה</Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── EDIT QUESTION TAB ── */}
                {activeTab === 'edit-question' && editQ && (
                    <div className="admin-card animate-fade-in" id="tab-edit-question">
                        <Button variant="ghost" onClick={() => { setActiveTab('manage-questions'); setEditQ(null); }} className="back-btn">
                            ⬅️ חזרה לרשימת השאלות
                        </Button>
                        <h3 className="card-title">
                            <span className="card-title-icon">✏️</span>
                            עריכת נתוני שאלה
                        </h3>

                        <div className="form-section">
                            <label className="section-label">קטגוריות משויכות:</label>
                            <div className="cat-checkboxes">
                                {Object.entries(categories).map(([id, cat]) => (
                                    <label key={id} className={`cat-checkbox ${editQ.categoryIds.includes(id) ? 'checked' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={editQ.categoryIds.includes(id)}
                                            onChange={() => toggleCategory(id, 'edit')}
                                        />
                                        <span>{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            id="edit-question-text"
                            label="תוכן השאלה:"
                            value={editQ.text}
                            onChange={(e) => setEditQ((p) => ({ ...p, text: e.target.value }))}
                            rows={7}
                        />

                        {editQ.type === 'multiple' && (
                            <div className="form-section">
                                <label className="section-label">אפשרויות תשובה:</label>
                                <div className="options-list">
                                    {editQ.options.map((opt, i) => (
                                        <div key={i} className="option-row">
                                            <input
                                                type="radio"
                                                name="editCorrect"
                                                checked={editQ.correctOptionIndex === i}
                                                onChange={() => setEditQ((p) => ({ ...p, correctOptionIndex: i }))}
                                                className="option-radio"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...editQ.options];
                                                    newOpts[i] = e.target.value;
                                                    setEditQ((p) => ({ ...p, options: newOpts }));
                                                }}
                                                placeholder="הזן תשובה אפשרית"
                                                className="option-input"
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditQ((p) => ({ ...p, options: [...p.options, ''] }))}
                                    >
                                        + הוסף אפשרות
                                    </Button>
                                </div>
                            </div>
                        )}

                        {editQ.type !== 'multiple' && (
                            <>
                                <div className="checkbox-field">
                                    <label className="custom-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={editQ.hasFlag}
                                            onChange={(e) => setEditQ((p) => ({ ...p, hasFlag: e.target.checked }))}
                                        />
                                        <span className="checkmark" />
                                        <span>בדיקה אוטומטית</span>
                                    </label>
                                </div>
                                {editQ.hasFlag && (
                                    <Input
                                        id="edit-question-answer"
                                        label="תשובה נכונה:"
                                        value={editQ.answer || ''}
                                        onChange={(e) => setEditQ((p) => ({ ...p, answer: e.target.value }))}
                                        placeholder="תשובה נכונה"
                                    />
                                )}
                            </>
                        )}

                        <Button onClick={handleUpdateQuestion} variant="success" fullWidth size="xl" className="mt-xl">
                            עדכן נתונים
                        </Button>
                    </div>
                )}

                {/* ── MANAGE CATEGORIES TAB ── */}
                {activeTab === 'manage-categories' && !viewCatId && (
                    <div className="admin-card animate-fade-in" id="tab-manage-categories">
                        <h3 className="card-title">
                            <span className="card-title-icon">📂</span>
                            ניהול קטגוריות
                            <span className="card-title-badge">{Object.keys(categories).length}</span>
                        </h3>

                        <div className="items-list">
                            {Object.entries(categories).map(([id, cat], index) => (
                                <div key={id} className="list-item animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="item-info">
                                        <span className="item-folder-icon">📁</span>
                                        <span className="item-text" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{cat.name}</span>
                                    </div>
                                    <div className="item-actions">
                                        <Button variant="outline" size="sm" onClick={() => setViewCatId(id)}>שאלות בקטגוריה</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(id)}>מחיקה</Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="add-category-section">
                            <h4 className="section-subtitle">הוספת קטגוריה חדשה</h4>
                            <div className="add-category-row">
                                <Input
                                    id="new-category-input"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="שם הקטגוריה (למשל: תקשורת, קריפטוגרפיה...)"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <Button onClick={handleAddCategory} size="lg">הוסף</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── VIEW CATEGORY DETAILS ── */}
                {activeTab === 'manage-categories' && viewCatId && (
                    <div className="admin-card animate-fade-in" id="tab-view-category">
                        <Button variant="ghost" onClick={() => setViewCatId(null)} className="back-btn">
                            ⬅️ חזרה לקטגוריות
                        </Button>
                        <h3 className="card-title">
                            <span className="card-title-icon">📂</span>
                            שאלות המשויכות ל: {categories[viewCatId]?.name}
                        </h3>

                        <div className="items-list">
                            {Object.entries(questions)
                                .filter(([, q]) => (q.categoryIds || []).includes(viewCatId))
                                .map(([id, q], i) => (
                                    <div key={id} className="list-item">
                                        <div className="item-info">
                                            <span className="item-number">{i + 1}</span>
                                            <span className="item-text">{q.text}</span>
                                        </div>
                                        <span className="answer-badge">{q.answer || '—'}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* ── GRADES TAB ── */}
                {activeTab === 'grades' && !selectedStudent && (
                    <div className="admin-card animate-fade-in" id="tab-grades">
                        <h3 className="card-title">
                            <span className="card-title-icon">📊</span>
                            מעקב הגשות חניכים
                            <span className="card-title-badge">{studentNames.length}</span>
                        </h3>

                        <div className="items-list">
                            {studentNames.map((name, index) => (
                                <div
                                    key={name}
                                    className="list-item clickable animate-slide-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => setSelectedStudent(name)}
                                >
                                    <div className="item-info">
                                        <span className="student-avatar">👤</span>
                                        <span className="item-text" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{name}</span>
                                    </div>
                                    <Button variant="success" size="sm">צפה בהגשות</Button>
                                </div>
                            ))}

                            {studentNames.length === 0 && (
                                <div className="empty-state">
                                    <span className="empty-icon">📭</span>
                                    <p>אין הגשות עדיין</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── STUDENT DETAIL ── */}
                {activeTab === 'grades' && selectedStudent && (
                    <div className="admin-card animate-fade-in" id="tab-student-detail">
                        <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="back-btn">
                            ⬅️ חזרה לרשימה
                        </Button>
                        <h3 className="card-title">
                            <span className="card-title-icon">👤</span>
                            ציונים עבור: {selectedStudent}
                        </h3>

                        <div className="submissions-list">
                            {Object.entries(submissions)
                                .filter(([, s]) => s.student === selectedStudent)
                                .map(([id, s]) => (
                                    <div
                                        key={id}
                                        className={`submission-card ${s.isCorrect === true ? 'correct' : s.isCorrect === false ? 'incorrect' : 'pending'}`}
                                    >
                                        <p className="submission-question">{s.questionText}</p>
                                        <div className="submission-answer">
                                            <span className="submission-label">תשובה שנשלחה:</span>
                                            <span className="submission-value">{s.userAnswer}</span>
                                        </div>
                                        <div className="submission-status">
                                            <span>סטטוס: {s.isCorrect === true ? '✅ נכון' : s.isCorrect === false ? '❌ שגוי' : '⏳ ממתין לבדיקה'}</span>
                                        </div>
                                        {!s.hasFlag && (
                                            <div className="submission-actions">
                                                <Button variant="success" size="sm" onClick={() => handleMarkSubmission(id, true)}>סמן כנכון</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleMarkSubmission(id, false)}>סמן כשגוי</Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* ── BROADCAST TAB ── */}
                {activeTab === 'broadcast' && (
                    <div className="admin-card animate-fade-in" id="tab-broadcast">
                        <h3 className="card-title">
                            <span className="card-title-icon">🚀</span>
                            ניהול שידור והפעלת אירוע
                        </h3>

                        <div className="broadcast-grid">
                            <Select
                                id="broadcast-category-select"
                                label="בחר קטגוריה לשידור חי:"
                                value={broadcastCatId}
                                onChange={(e) => setBroadcastCatId(e.target.value)}
                                options={categoryOptions}
                            />
                            <Select
                                id="game-mode-select"
                                label="מצב המשחק:"
                                value={gameMode}
                                onChange={(e) => setGameMode(e.target.value)}
                                options={[
                                    { value: 'quiz', label: 'מצב בוחן (חופשי)' },
                                    { value: 'escape', label: 'מצב חדר בריחה (נעילה בטעות)' },
                                ]}
                            />
                        </div>

                        <div className="broadcast-action">
                            <div className="broadcast-preview">
                                <span className="broadcast-preview-label">קטגוריה נבחרת:</span>
                                <span className="broadcast-preview-value">{categories[broadcastCatId]?.name || '—'}</span>
                            </div>
                            <Button onClick={handleBroadcast} variant="success" fullWidth size="xl" icon="🚀">
                                הפעל שידור לחניכים
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
