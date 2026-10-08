import React, { useState, useEffect } from 'react';

export default function CourseFeedbackPage({ user, onFeedbackSubmitted }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.courses || []);
        if (data.courses && data.courses.length > 0) {
          setSelectedCourseId(data.courses[0].id);
        }
      } else {
        setError('Failed to load courses.');
      }
    } catch (err) {
      setError('Network error while fetching courses.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedCourseId) {
      setError('Please select a course.');
      return;
    }

    if (!comment || comment.trim().length === 0) {
      setError('Please enter a feedback comment.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          course_id: Number(selectedCourseId),
          rating,
          comment: comment.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage('🎉 Thank you! Your feedback has been recorded successfully.');
        setComment('');
        setRating(5);
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      } else {
        setError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Network error submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="card feedback-form-card">
      <h2 className="card-title">✏️ Submit Course Feedback</h2>
      <p className="card-subtitle">
        Share your honest experience to help improve teaching quality and curriculum design.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Course</label>
          <select
            className="form-select"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            required
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code}: {course.title} — {course.instructor}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Rating</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= displayRating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Your Feedback</label>
          <textarea
            className="form-textarea"
            placeholder="Share your thoughts about the lectures, assignments, labs, and overall learning experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Submitting...' : '🚀 Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
