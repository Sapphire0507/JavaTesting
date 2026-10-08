import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">SF</div>
        <span className="brand-title">Student Feedback System</span>
      </div>

      <div className="nav-links">
        <button
          className={`nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          ✏️ Submit
        </button>

        <button
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Feedbacks
        </button>

        {user ? (
          <div className="user-badge">
            <span>● {user.name}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button
            className={`nav-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            🔐 Login
          </button>
        )}
      </div>
    </header>
  );
}
