import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import Input, { Textarea, Select } from '../../components/Input/Input';
import {
    getCategories, addCategory, updateCategory, deleteCategory,
    getQuestions, addQuestion, updateQuestion, deleteQuestion,
    getSubmissions, markSubmission, deleteAllSubmissions,
    updateSettings,
} from '../../services/firebase';

import './AdminPage.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'zigi2026';

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
        title: '', text: '', type: 'open', answer: '', hasFlag: true, categoryIds: [], options: ['', '', ''],
        correctOptionIndex: 0, imageUrl: '',
    });

    // Edit question
    const [editQ, setEditQ] = useState(null);
    const [editId, setEditId] = useState(null);

    // Categories
    const [newCatName, setNewCatName] = useState('');
    const [viewCatId, setViewCatId] = useState(null);
    const [editCatNameState, setEditCatNameState] = useState('');
    const [selectedQToAdd, setSelectedQToAdd] = useState('');

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

            // Migration: give order property if it doesn't exist to sort consistently
            const validQs = qs || {};
            let maxOrder = 0;
            Object.values(validQs).forEach(q => {
                if (q.order !== undefined && typeof q.order === 'number' && q.order > maxOrder) maxOrder = q.order;
            });
            let orderCounter = maxOrder + 1;
            Object.keys(validQs).forEach(key => {
                if (validQs[key].order === undefined) {
                    validQs[key].order = orderCounter++;
                    updateQuestion(key, validQs[key]).catch(err => console.error(err));
                }
            });

            setQuestions(validQs);
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

    const handleImageUpload = (e, target) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit for Realtime DB stability
            alert('התמונה גדולה מדי. אנא העלה תמונה קטנה מ-2MB (לשמירה על ה-Metadata).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (target === 'new') {
                setNewQ(prev => ({ ...prev, imageUrl: reader.result }));
            } else {
                setEditQ(prev => ({ ...prev, imageUrl: reader.result }));
            }
        };
        reader.readAsDataURL(file);
    };

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
        let maxOrder = 0;
        Object.values(questions).forEach(q => {
            if (q.order !== undefined && typeof q.order === 'number' && q.order > maxOrder) maxOrder = q.order;
        });

        let questionData = {
            title: newQ.title,
            text: newQ.text,
            type: newQ.type,
            hasFlag: newQ.hasFlag,
            categoryIds: newQ.categoryIds,
            imageUrl: newQ.imageUrl || '',
            answer: '',
            options: null,
            order: maxOrder + 1,
        };

        if (newQ.type === 'multiple') {
            const validOpts = newQ.options.filter((o) => o.trim());
            questionData.options = validOpts;
            questionData.answer = validOpts[newQ.correctOptionIndex] || '';
            questionData.hasFlag = true;
        } else if (newQ.type === 'explanation') {
            questionData.hasFlag = false;
            questionData.answer = '';
        } else {
            questionData.answer = newQ.hasFlag ? newQ.answer : '';
        }

        await addQuestion(questionData);
        setNewQ({ title: '', text: '', type: 'open', answer: '', hasFlag: true, categoryIds: [], options: ['', '', ''], correctOptionIndex: 0, imageUrl: '' });
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
        const updated = {
            title: editQ.title || '',
            text: editQ.text,
            type: editQ.type,
            hasFlag: editQ.type === 'explanation' ? false : editQ.hasFlag,
            categoryIds: editQ.categoryIds,
            imageUrl: editQ.imageUrl || '',
            order: editQ.order !== undefined ? editQ.order : 0,
            answer: editQ.type === 'explanation' ? '' : (editQ.hasFlag ? (editQ.type === 'multiple' ? editQ.options[editQ.correctOptionIndex] : editQ.answer) : ''),
            options: editQ.type === 'multiple' ? editQ.options.filter(o => o.trim()) : null
        };
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

    const handleMoveQuestion = async (id, direction) => {
        const sortedQs = Object.entries(questions).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
        const index = sortedQs.findIndex(q => q[0] === id);
        if (index === -1) return;

        let swapIndex = -1;
        if (direction === 'up' && index > 0) swapIndex = index - 1;
        if (direction === 'down' && index < sortedQs.length - 1) swapIndex = index + 1;

        if (swapIndex !== -1) {
            const current = sortedQs[index];
            const sibling = sortedQs[swapIndex];

            // Swap order values
            const tempOrder = current[1].order;
            current[1].order = sibling[1].order;
            sibling[1].order = tempOrder;

            // In case orders were identically messed up
            if (current[1].order === sibling[1].order) {
                current[1].order = swapIndex;
                sibling[1].order = index;
            }

            // Optimistic update
            setQuestions(prev => ({
                ...prev,
                [current[0]]: { ...prev[current[0]], order: current[1].order },
                [sibling[0]]: { ...prev[sibling[0]], order: sibling[1].order }
            }));

            Promise.all([
                updateQuestion(current[0], { ...current[1], order: current[1].order }),
                updateQuestion(sibling[0], { ...sibling[1], order: sibling[1].order })
            ]).then(() => refreshData());
        }
    };

    const handleMoveQuestionInCategory = async (id, direction, catId) => {
        const getOrder = (q) => (q.categoryOrder && q.categoryOrder[catId] !== undefined) ? q.categoryOrder[catId] : (q.order || 0);

        const sortedQs = Object.entries(questions)
            .filter(([, q]) => (q.categoryIds || []).includes(catId))
            .sort((a, b) => getOrder(a[1]) - getOrder(b[1]));

        const index = sortedQs.findIndex(q => q[0] === id);
        if (index === -1) return;

        let swapIndex = -1;
        if (direction === 'up' && index > 0) swapIndex = index - 1;
        if (direction === 'down' && index < sortedQs.length - 1) swapIndex = index + 1;

        if (swapIndex !== -1) {
            const current = sortedQs[index];
            const sibling = sortedQs[swapIndex];

            let currentOrder = getOrder(current[1]);
            let siblingOrder = getOrder(sibling[1]);

            if (currentOrder === siblingOrder) {
                currentOrder = index;
                siblingOrder = swapIndex;
            }

            const newCurrentCatOrder = { ...(current[1].categoryOrder || {}), [catId]: siblingOrder };
            const newSiblingCatOrder = { ...(sibling[1].categoryOrder || {}), [catId]: currentOrder };

            setQuestions(prev => ({
                ...prev,
                [current[0]]: { ...prev[current[0]], categoryOrder: newCurrentCatOrder },
                [sibling[0]]: { ...prev[sibling[0]], categoryOrder: newSiblingCatOrder }
            }));

            Promise.all([
                updateQuestion(current[0], { ...current[1], categoryOrder: newCurrentCatOrder }),
                updateQuestion(sibling[0], { ...sibling[1], categoryOrder: newSiblingCatOrder })
            ]).then(() => refreshData());
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

    const handleRemoveFromCategory = async (questionId, catId) => {
        if (window.confirm('האם להסיר את השאלה מקטגוריה זו?')) {
            const q = questions[questionId];
            const updatedIds = (q.categoryIds || []).filter(id => id !== catId);
            await updateQuestion(questionId, { ...q, categoryIds: updatedIds });
            await refreshData();
        }
    };

    const handleUpdateCategoryName = async (catId, newName) => {
        if (!newName.trim()) return;
        await updateCategory(catId, newName.trim());
        await refreshData();
        alert('שם הקטגוריה עודכן בהצלחה');
    };

    const handleAddToCategory = async (questionId, catId) => {
        if (!questionId) return;
        const q = questions[questionId];
        if ((q.categoryIds || []).includes(catId)) return;
        const updatedIds = [...(q.categoryIds || []), catId];
        await updateQuestion(questionId, { ...q, categoryIds: updatedIds });
        await refreshData();
    };

    // ── Grading ─────────────────────────────────────────────
    const handleMarkSubmission = async (subId, isCorrect) => {
        await markSubmission(subId, isCorrect);
        await loadSubmissions();
    };

    const studentNames = [...new Set(Object.values(submissions).map((s) => s.student))];

    const handleDeleteAllSubmissions = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את כל נתוני ההגשות? פעולה זו אינה הפיכה.')) {
            await deleteAllSubmissions();
            await loadSubmissions();
        }
    };

    const calculateStudentGrade = (name) => {
        const studentSubs = Object.values(submissions).filter(s => s.student === name);
        if (studentSubs.length === 0) return 0;
        const correct = studentSubs.filter(s => s.isCorrect === true).length;
        return Math.round((correct / studentSubs.length) * 100);
    };

    const exportGrades = () => {
        const data = studentNames.map(name => ({
            name,
            grade: calculateStudentGrade(name),
            submissions: Object.values(submissions).filter(s => s.student === name).length
        }));

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Grade,Total Submissions\n";
        data.forEach(row => {
            csvContent += `${row.name},${row.grade}%,${row.submissions}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "grades_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    <img src="/Robot emblem cutout.png" className="admin-login-logo" alt="Logo" />
                    <h1 className="text-gradient">אתגר ענף שיטור דיגיטלי</h1>
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
                                    { value: 'open', label: 'שאלה פתוחה' },
                                    { value: 'multiple', label: 'שאלה אמריקאית' },
                                    { value: 'explanation', label: 'הסבר (ללא מענה)' },
                                ]}
                            />
                            {newQ.type !== 'explanation' && (
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
                            )}
                        </div>

                        <Input
                            id="question-title-input"
                            label="כותרת השאלה:"
                            value={newQ.title}
                            onChange={(e) => setNewQ((p) => ({ ...p, title: e.target.value }))}
                            placeholder="למשל: אתגר הצפנה #1"
                        />

                        <Textarea
                            id="question-text-input"
                            label="תוכן השאלה / האתגר:"
                            value={newQ.text}
                            onChange={(e) => setNewQ((p) => ({ ...p, text: e.target.value }))}
                            placeholder="הקלד כאן את השאלה..."
                            rows={6}
                        />

                        <div className="form-section">
                            <label className="section-label">צירוף תמונה / קובץ:</label>
                            <div className="image-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'new')}
                                    id="new-q-image"
                                    className="file-input-hidden"
                                />
                                <label htmlFor="new-q-image" className="file-upload-label">
                                    <span className="upload-icon">🖼️</span>
                                    {newQ.imageUrl ? 'החלף תמונה' : 'בחר תמונה מהמחשב'}
                                </label>
                                {newQ.imageUrl && (
                                    <div className="image-preview-container">
                                        <img src={newQ.imageUrl} alt="Preview" className="image-preview" />
                                        <div className="image-actions-overlay">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = newQ.imageUrl;
                                                    link.download = `challenge_image_${Date.now()}`;
                                                    link.click();
                                                }}
                                            >
                                                📥 הורדה (עם Metadata)
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => setNewQ(p => ({ ...p, imageUrl: '' }))}
                                                className="remove-img-btn"
                                            >
                                                מחק תמונה
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

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
                                        <div key={i} className={`option-row ${newQ.correctOptionIndex === i ? 'selected' : ''}`}>
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
                            {Object.entries(questions)
                                .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                                .map(([id, q], index) => (
                                    <div key={id} className="list-item animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="item-info">
                                            <span className="item-number">{index + 1}</span>
                                            <div className="item-details">
                                                <span className="item-text" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{q.title || 'ללא כותרת'}</span>
                                                <span className="item-text">{q.text.substring(0, 120)}{q.text.length > 120 ? '...' : ''}</span>
                                                <div className="item-meta">
                                                    <span className="tag tag-type">{q.type === 'multiple' ? 'אמריקאית' : q.type === 'explanation' ? 'הסבר' : 'פתוחה'}</span>
                                                    {q.hasFlag && <span className="tag tag-flag">🚩 Flag</span>}
                                                    {q.categoryIds && q.categoryIds.map(catId => (
                                                        <span key={catId} className="tag tag-category">
                                                            📂 {categories[catId]?.name || 'קטגוריה הוסרה'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveQuestion(id, 'up')} title="הזז למעלה">⬆️</Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveQuestion(id, 'down')} title="הזז למטה">⬇️</Button>
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

                        <Input
                            id="edit-question-title"
                            label="כותרת השאלה:"
                            value={editQ.title || ''}
                            onChange={(e) => setEditQ((p) => ({ ...p, title: e.target.value }))}
                        />

                        <Textarea
                            id="edit-question-text"
                            label="תוכן השאלה:"
                            value={editQ.text}
                            onChange={(e) => setEditQ((p) => ({ ...p, text: e.target.value }))}
                            rows={7}
                        />

                        <div className="form-section">
                            <label className="section-label">תמונה מצורפת:</label>
                            <div className="image-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'edit')}
                                    id="edit-q-image"
                                    className="file-input-hidden"
                                />
                                <label htmlFor="edit-q-image" className="file-upload-label">
                                    <span className="upload-icon">🖼️</span>
                                    {editQ.imageUrl ? 'החלף תמונה' : 'בחר תמונה מהמחשב'}
                                </label>
                                {editQ.imageUrl && (
                                    <div className="image-preview-container">
                                        <img src={editQ.imageUrl} alt="Preview" className="image-preview" />
                                        <div className="image-actions-overlay">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = editQ.imageUrl;
                                                    link.download = `edit_image_${Date.now()}`;
                                                    link.click();
                                                }}
                                            >
                                                📥 הורדה
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => setEditQ(p => ({ ...p, imageUrl: '' }))}
                                                className="remove-img-btn"
                                            >
                                                מחק תמונה
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {editQ.type === 'multiple' && (
                            <div className="form-section">
                                <label className="section-label">אפשרויות תשובה:</label>
                                <div className="options-list">
                                    {editQ.options.map((opt, i) => (
                                        <div key={i} className={`option-row ${editQ.correctOptionIndex === i ? 'selected' : ''}`}>
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

                        {editQ.type !== 'multiple' && editQ.type !== 'explanation' && (
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
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setViewCatId(id);
                                            setEditCatNameState(cat.name || '');
                                        }}>עריכה</Button>
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

                {/* ── VIEW / EDIT CATEGORY DETAILS ── */}
                {activeTab === 'manage-categories' && viewCatId && (
                    <div className="admin-card animate-fade-in" id="tab-view-category">
                        <Button variant="ghost" onClick={() => { setViewCatId(null); setSelectedQToAdd(''); }} className="back-btn">
                            ⬅️ חזרה לקטגוריות
                        </Button>
                        <h3 className="card-title">
                            <span className="card-title-icon">📂</span>
                            עריכת קטגוריה: {categories[viewCatId]?.name}
                        </h3>

                        <div className="form-section">
                            <label className="section-label">שם הקטגוריה:</label>
                            <div className="add-category-row">
                                <Input
                                    id="edit-cat-name"
                                    value={editCatNameState}
                                    onChange={(e) => setEditCatNameState(e.target.value)}
                                    placeholder="שם הקטגוריה"
                                />
                                <Button onClick={() => handleUpdateCategoryName(viewCatId, editCatNameState)} variant="success">שמור שם</Button>
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="section-label">הוסף שאלה לקטגוריה זו:</label>
                            <div className="add-category-row">
                                <Select
                                    id="add-question-to-cat"
                                    value={selectedQToAdd}
                                    onChange={(e) => setSelectedQToAdd(e.target.value)}
                                    options={[
                                        { value: '', label: '-- בחר שאלה להוספה --' },
                                        ...Object.entries(questions)
                                            .filter(([, q]) => !(q.categoryIds || []).includes(viewCatId))
                                            .map(([id, q]) => ({ value: id, label: q.title || (q.text && q.text.substring(0, 30)) || 'שאלה ללא שם' }))
                                    ]}
                                />
                                <Button
                                    onClick={() => { handleAddToCategory(selectedQToAdd, viewCatId); setSelectedQToAdd(''); }}
                                    variant="outline"
                                >הוסף שיוך</Button>
                            </div>
                        </div>

                        <h4 className="section-subtitle" style={{ marginTop: '20px' }}>שאלות המשויכות לקטגוריה זו</h4>

                        <div className="items-list">
                            {Object.entries(questions)
                                .filter(([, q]) => (q.categoryIds || []).includes(viewCatId))
                                .sort((a, b) => {
                                    const aOrder = a[1].categoryOrder && a[1].categoryOrder[viewCatId] !== undefined ? a[1].categoryOrder[viewCatId] : (a[1].order || 0);
                                    const bOrder = b[1].categoryOrder && b[1].categoryOrder[viewCatId] !== undefined ? b[1].categoryOrder[viewCatId] : (b[1].order || 0);
                                    return aOrder - bOrder;
                                })
                                .map(([id, q], i) => (
                                    <div key={id} className="list-item">
                                        <div className="item-info">
                                            <span className="item-number">{i + 1}</span>
                                            <div className="item-details">
                                                <span className="item-text" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{q.title || 'ללא כותרת'}</span>
                                                <span className="item-text">{q.text}</span>
                                                <span className="answer-badge" style={{ marginTop: '4px', alignSelf: 'start' }}>
                                                    תשובה: {q.answer || '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveQuestionInCategory(id, 'up', viewCatId)} title="הזז למעלה">⬆️</Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleMoveQuestionInCategory(id, 'down', viewCatId)} title="הזז למטה">⬇️</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleRemoveFromCategory(id, viewCatId)}>
                                                הסר מהקטגוריה
                                            </Button>
                                        </div>
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
                            <div style={{ marginRight: 'auto', display: 'flex', gap: '10px' }}>
                                <Button variant="outline" size="sm" onClick={exportGrades} disabled={studentNames.length === 0}>
                                    📥 ייצוא נתונים
                                </Button>
                                <Button variant="danger" size="sm" onClick={handleDeleteAllSubmissions} disabled={studentNames.length === 0}>
                                    🗑️ נקה הכל
                                </Button>
                            </div>
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
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="item-text" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{name}</span>
                                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                ציון: {calculateStudentGrade(name)}%
                                            </span>
                                        </div>
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
                                        <div className="submission-actions">
                                            <Button variant="success" size="sm" onClick={() => handleMarkSubmission(id, true)}>סמן כנכון</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleMarkSubmission(id, false)}>סמן כשגוי</Button>
                                        </div>
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
