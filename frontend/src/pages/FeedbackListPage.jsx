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
        <div className="stat-box stat-box--blue">
          <div className="stat-value stat-value--blue">{summary.total}</div>
          <div className="stat-label">Total Submissions</div>
        </div>

        <div className="stat-box stat-box--orange">
          <div className="stat-value stat-value--orange">
            {summary.average_rating} ★
          </div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="card feedback-list-card">
        <h2 className="card-title">📋 Recent Student Feedback</h2>
        <p className="card-subtitle">Transparent student reviews and ratings across all courses</p>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p>Loading feedback entries...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No feedback entries submitted yet.<br />Be the first student to leave feedback!</p>
          </div>
        ) : (
          <div>
            {feedbackList.map((item) => (
              <div key={item.id} className="feedback-item">
                <div className="feedback-header">
                  <div>
                    <span className="course-badge">{item.course_code}</span>
                    <strong style={{ marginLeft: '10px', fontSize: '0.95rem' }}>
                      {item.course_title}
                    </strong>
                  </div>
                  <div className="feedback-stars">
                    {renderStars(item.rating)}
                  </div>
                </div>

                <div className="student-info">
                  By <strong>{item.student_name}</strong> · Instructor: {item.course_instructor}
                </div>

                <div className="feedback-comment">"{item.comment}"</div>

                <div className="feedback-date">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
