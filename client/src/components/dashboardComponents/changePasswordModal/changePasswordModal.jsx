import React, { useState } from 'react';
import './style.css';
import Request from "../../request";


const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await Request.auth.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                />
                <div className="input-icon">
                  <i className="password-icon"></i>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
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
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
                <div className="input-icon">
                  <i className="password-icon"></i>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;