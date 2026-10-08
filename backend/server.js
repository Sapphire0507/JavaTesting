require('dotenv').config();
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MINIMOTH_API_KEY = process.env.MINIMOTH_API_KEY;

// ==========================================
// 5 BACKEND API ENDPOINTS
// ==========================================

// Endpoint 1: Send OTP via Minimoth API
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Valid phone number is required (at least 10 digits).' });
    }

    const cleanPhone = phone.trim();

    // Call Minimoth API if API key is configured
    if (MINIMOTH_API_KEY && MINIMOTH_API_KEY.trim() !== '') {
      const response = await fetch('https://api.minimoth.dev/v1/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': MINIMOTH_API_KEY.trim()
        },
        body: JSON.stringify({ phone: cleanPhone })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: data.message || data.error || 'Failed to send OTP via Minimoth API'
        });
      }

      return res.json({
        success: true,
        message: 'OTP sent successfully via Minimoth.',
        otp_id: data.otp_id
      });
    } else {
      // Demo fallback when MINIMOTH_API_KEY is not configured
      console.log(`[DEMO MODE] OTP for ${cleanPhone} is 123456`);
      return res.json({
        success: true,
        message: 'OTP sent successfully. (Demo Mode: Enter OTP 123456)'
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while sending OTP.' });
  }
});

// Endpoint 2: Verify OTP & Register/Login User
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, code, name } = req.body;

    if (!phone || !code || !name) {
      return res.status(400).json({ success: false, error: 'Phone, OTP code, and full name are required.' });
    }

    const cleanPhone = phone.trim();
    const cleanCode = code.trim();
    const cleanName = name.trim();

    let verified = false;

    // Call Minimoth API if API key is configured
    if (MINIMOTH_API_KEY && MINIMOTH_API_KEY.trim() !== '') {
      const response = await fetch('https://api.minimoth.dev/v1/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': MINIMOTH_API_KEY.trim()
        },
        body: JSON.stringify({ phone: cleanPhone, code: cleanCode })
      });

      const data = await response.json();

      if (response.ok) {
        verified = true;
      } else {
        return res.status(400).json({
          success: false,
          error: data.message || data.error || 'Invalid OTP code'
        });
      }
    } else {
      // Demo fallback: OTP 123456 is valid
      if (cleanCode === '123456') {
        verified = true;
      } else {
        return res.status(400).json({ success: false, error: 'Invalid OTP code. Use 123456 in demo mode.' });
      }
    }

    if (verified) {
      // Check if user already exists
      const getUser = db.prepare('SELECT * FROM users WHERE phone = ?');
      let user = getUser.get(cleanPhone);

      if (!user) {
        // Register new user
        const insertUser = db.prepare('INSERT INTO users (phone, name) VALUES (?, ?)');
        const result = insertUser.run(cleanPhone, cleanName);
        user = { id: result.lastInsertRowid, phone: cleanPhone, name: cleanName };
      }

      return res.json({
        success: true,
        message: 'Authentication successful',
        user: { id: user.id, phone: user.phone, name: user.name }
      });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying OTP.' });
  }
});

// Endpoint 3: Get All Courses
app.get('/api/courses', (req, res) => {
  try {
    const getCourses = db.prepare('SELECT * FROM courses ORDER BY code ASC');
    const courses = getCourses.all();
    return res.json({ success: true, courses });
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch courses.' });
  }
});

// Endpoint 4: Submit Student Feedback
app.post('/api/feedback', (req, res) => {
  try {
    const { user_id, course_id, rating, comment } = req.body;

    if (!user_id || !course_id || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'All fields (user_id, course_id, rating, comment) are required.' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5.' });
    }

    const cleanComment = comment.trim();
    if (cleanComment.length === 0) {
      return res.status(400).json({ success: false, error: 'Comment cannot be empty.' });
    }

    // Check user existence
    const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id);
    if (!userCheck) {
      return res.status(404).json({ success: false, error: 'User not found. Please log in first.' });
    }

    // Check course existence
    const courseCheck = db.prepare('SELECT id FROM courses WHERE id = ?').get(course_id);
    if (!courseCheck) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }

    const insertFeedback = db.prepare(
      'INSERT INTO feedback (user_id, course_id, rating, comment) VALUES (?, ?, ?, ?)'
    );
    const result = insertFeedback.run(user_id, course_id, numericRating, cleanComment);

    const newFeedback = db.prepare('SELECT * FROM feedback WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while submitting feedback.' });
  }
});

// Endpoint 5: Get Feedback Submissions & Summary
app.get('/api/feedback', (req, res) => {
  try {
    const query = `
      SELECT 
        f.id,
        f.rating,
        f.comment,
        f.created_at,
        u.name as student_name,
        u.phone as student_phone,
        c.code as course_code,
        c.title as course_title,
        c.instructor as course_instructor
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      JOIN courses c ON f.course_id = c.id
      ORDER BY f.created_at DESC
    `;
    const feedbackList = db.prepare(query).all();

    const stats = db.prepare('SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM feedback').get();

    return res.json({
      success: true,
      summary: {
        total: stats.total || 0,
        average_rating: stats.avg_rating ? Number(stats.avg_rating.toFixed(1)) : 0
      },
      feedbackList
    });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve feedback list.' });
  }
});

app.listen(PORT, () => {
  console.log(`Student Feedback System Backend running on http://localhost:${PORT}`);
});

