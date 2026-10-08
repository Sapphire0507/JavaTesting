import React, { useState, useEffect } from 'react';

export default function FeedbackListPage() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackList(data.feedbackList || []);
        setSummary(data.summary || { total: 0, average_rating: 0 });
      } else {
        setError('Failed to load feedback entries.');
      }
    } catch (err) {
      setError('Network error while retrieving feedback.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div>
      <div className="summary-grid">
        <div className="stat-box">
          <div className="stat-value">{summary.total}</div>
          <div className="stat-label">Total Submissions</div>
        </div>

        <div className="stat-box" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-value" style={{ color: '#d97706' }}>
            {summary.average_rating} <span style={{ fontSize: '1.2rem' }}>★</span>
          </div>
          <div className="stat-label">Average System Rating</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Student Feedback</h2>
        <p className="card-subtitle">Transparent student reviews and ratings across all courses</p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>Loading feedback entries...</p>
        ) : feedbackList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
            No feedback entries submitted yet. Be the first student to leave feedback!
          </p>
        ) : (
          <div>
            {feedbackList.map((item) => (
              <div key={item.id} className="feedback-item">
                <div className="feedback-header">
                  <div>
                    <span className="course-badge">{item.course_code}</span>
                    <strong style={{ marginLeft: '8px', fontSize: '1rem' }}>{item.course_title}</strong>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {renderStars(item.rating)}
                  </div>
                </div>

                <div className="student-info">
                  By <strong>{item.student_name}</strong> • Instructor: {item.course_instructor}
                </div>

                <div className="feedback-comment">"{item.comment}"</div>

                <div className="feedback-date">
                  Submitted on {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

