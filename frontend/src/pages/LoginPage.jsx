import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setInfoMessage(data.message || 'OTP sent successfully!');
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network error. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.trim().length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    if (!name || name.trim().length === 0) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
          name: name.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'OTP verification failed.');
      }
    } catch (err) {
      setError('Network error during OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-card" style={{ maxWidth: '460px', margin: '40px auto' }}>
      <h2 className="card-title" style={{ textAlign: 'center' }}>
        🔐 Student Portal
      </h2>
      <p className="card-subtitle" style={{ textAlign: 'center' }}>
        Authenticate with your phone number via Minimoth OTP
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {infoMessage && <div className="alert alert-info">{infoMessage}</div>}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Sending OTP...' : '📲 Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Digit OTP Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength="6"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Verifying...' : '✅ Verify & Enter'}
          </button>

          <button
            type="button"
            className="nav-btn"
            style={{ width: '100%', marginTop: '12px', textAlign: 'center' }}
            onClick={() => {
              setStep('phone');
              setError('');
              setInfoMessage('');
            }}
          >
            ← Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
