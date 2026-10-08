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
          Submit Feedback
        </button>

        <button
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          All Feedbacks
        </button>

        {user ? (
          <div className="user-badge">
            <span>👤 {user.name} ({user.phone})</span>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              Logout
            </button>
          </div>
        ) : (
          <button
            className={`nav-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login / OTP
          </button>
        )}
      </div>
    </header>
  );
}

