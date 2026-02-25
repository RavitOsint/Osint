import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StudentPage from './pages/Student/StudentPage';
import AdminPage from './pages/Admin/AdminPage';
import './App.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-orb orb-a" />
      <div className="landing-orb orb-b" />
      <div className="landing-orb orb-c" />

      <div className="landing-container">
        <div className="landing-content animate-fade-in-up">
          <span className="landing-symbol">⟁</span>
          <h1 className="landing-title">
            <span className="text-gradient">CyberQuest</span>
          </h1>
          <p className="landing-description">
            פלטפורמת אתגרי סייבר ו-OSINT אינטראקטיבית
          </p>
          <p className="landing-subtitle">
            בחר את נקודת הכניסה שלך למערכת
          </p>

          <div className="landing-cards">
            <Link to="/student" className="landing-card card-student" id="nav-student">
              <div className="card-icon-wrap">
                <span className="card-main-icon">🎯</span>
              </div>
              <h2>כניסת חניכים</h2>
              <p>התחבר לאתגרים וענה על שאלות בזמן אמת</p>
              <span className="card-arrow">←</span>
            </Link>

            <Link to="/admin" className="landing-card card-admin" id="nav-admin">
              <div className="card-icon-wrap">
                <span className="card-main-icon">⚙️</span>
              </div>
              <h2>לוח בקרה</h2>
              <p>ניהול שאלות, קטגוריות, ציונים ושידור חי</p>
              <span className="card-arrow">←</span>
            </Link>
          </div>

          <div className="landing-stats">
            <div className="stat-item">
              <span className="stat-icon">🔐</span>
              <span className="stat-label">מאובטח</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">זמן אמת</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">🌐</span>
              <span className="stat-label">Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
