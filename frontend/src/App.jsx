import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CourseFeedbackPage from './pages/CourseFeedbackPage';
import FeedbackListPage from './pages/FeedbackListPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('submit');

  useEffect(() => {
    const storedUser = localStorage.getItem('student_feedback_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('student_feedback_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('student_feedback_user', JSON.stringify(userData));
    setActiveTab('submit');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('student_feedback_user');
    setActiveTab('login');
  };

  const handleFeedbackSubmitted = () => {
    // Navigate to feedback list after 1.5s
    setTimeout(() => {
      setActiveTab('list');
    }, 1500);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main>
        {activeTab === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}

        {activeTab === 'submit' && (
          user ? (
            <CourseFeedbackPage
              user={user}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          ) : (
            <div>
              <div className="alert alert-info" style={{ textAlign: 'center', marginBottom: '20px' }}>
                🔑 Please log in via OTP to submit feedback for your courses.
              </div>
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            </div>
          )
        )}

        {activeTab === 'list' && (
          <FeedbackListPage />
        )}
      </main>
    </div>
  );
}

