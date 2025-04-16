import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.css';
import Request from '../../request';
import logoImg from '../../../static/images/sidebarLogo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await Request.auth.requestPasswordReset({ email });
      
      if (response.data.success) {
        setSuccess('A verification code has been sent to your email');
        setStep('verify');
      }
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify code and get reset token
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await Request.auth.verifyResetCode({ email, code: verificationCode });
      
      if (response.data.success) {
        setToken(response.data.token);
        setSuccess('Code verified successfully! You can now reset your password');
        setStep('reset');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await Request.auth.resetPassword({
        email,
        token,
        password: newPassword
      });
      
      if (response.data.success) {
        setSuccess('Your password has been reset successfully!');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="card-left">
          <div className="logo-container">
            <img 
              src={logoImg} 
              alt="Bolletta Più Logo" 
              className="signin-logo"
            />
            <p className="signin-subtitle">
              {step === 'request' && 'Reset your password'}
              {step === 'verify' && 'Verify your identity'}
              {step === 'reset' && 'Create a new password'}
            </p>
          </div>

          {/* Error and success messages */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Request step */}
          {step === 'request' && (
            <form className="forgot-password-form" onSubmit={handleRequestReset}>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <div className="input-icon">
                    <i className="email-icon"></i>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <div className="form-footer">
                <p>Remember your password? <Link to="/signin">Sign in</Link></p>
              </div>
            </form>
          )}

          {step === 'verify' && (
            <form className="forgot-password-form" onSubmit={handleVerifyCode}>
              <div className="form-group">
                <label htmlFor="verification-code">Verification Code</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter the 6-digit code"
                    maxLength="6"
                    required
                  />
                  <div className="input-icon">
                    <i className="code-icon"></i>
                  </div>
                </div>
                <p className="input-hint">Check your email for a 6-digit verification code</p>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="form-actions">
                <button 
                  type="button"
                  className="back-button"
                  onClick={() => setStep('request')}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="button"
                  className="resend-button"
                  onClick={handleRequestReset}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Reset step */}
          {step === 'reset' && (
            <form className="forgot-password-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength="6"
                    required
                  />
                  <div className="input-icon">
                    <i className="password-icon"></i>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <div className="input-container">
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <div className="input-icon">
                    <i className="password-icon"></i>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="form-footer">
                <Link to="/signin" className="signin-link">Back to Sign In</Link>
              </div>
            </form>
          )}
        </div>

        <div className="card-right">

        <svg width="150" height="200" viewBox="0 0 150 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="lockBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4A90E2"/>
      <stop offset="100%" stop-color="#003366"/>
    </linearGradient>
    <radialGradient id="shine" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ffffff33" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>

  <path d="M45 80 C45 50, 105 50, 105 80" stroke="#4A90E2" stroke-width="10" fill="none" stroke-linecap="round"/>

  <rect x="30" y="80" width="90" height="100" rx="12" ry="12" fill="url(#lockBody)" stroke="#003366" stroke-width="3"/>

  <rect x="30" y="80" width="90" height="100" rx="12" ry="12" fill="url(#shine)"/>

  <circle cx="75" cy="130" r="8" fill="#fff"/>
  <rect x="72" y="138" width="6" height="15" rx="3" fill="#fff"/>
</svg>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;