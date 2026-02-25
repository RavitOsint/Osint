import './Sidebar.css';

const NAV_ITEMS = [
    { id: 'add-question', label: 'הוספת שאלה', icon: '➕', emoji: true },
    { id: 'manage-questions', label: 'ניהול שאלות', icon: '📝', emoji: true },
    { id: 'manage-categories', label: 'ניהול קטגוריות', icon: '📂', emoji: true },
    { id: 'grades', label: 'ציונים והגשות', icon: '📊', emoji: true },
    { id: 'broadcast', label: 'שידור חי', icon: '🚀', emoji: true },
];

export default function Sidebar({ activeTab, onTabChange }) {
    return (
        <aside className="sidebar" role="navigation" aria-label="Admin navigation">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="sidebar-logo-icon">⟁</span>
                    <div>
                        <h2 className="sidebar-brand">CYBERQUEST</h2>
                        <span className="sidebar-version">Admin Panel v5.0</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        id={`nav-${item.id}`}
                        className={`sidebar-btn ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                        aria-current={activeTab === item.id ? 'page' : undefined}
                    >
                        <span className="sidebar-btn-icon">{item.icon}</span>
                        <span className="sidebar-btn-label">{item.label}</span>
                        {activeTab === item.id && <span className="sidebar-btn-indicator" />}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-status">
                    <span className="status-dot" />
                    <span>מחובר למערכת</span>
                </div>
            </div>
        </aside>
    );
}
