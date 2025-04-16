import React, { useState, useEffect } from 'react';
import './style.css';
import Request from '../../../request';
import { useAuth } from '../../../../context/context';
import ChangePasswordModal from '../../../dashboardComponents/changePasswordModal/changePasswordModal';


const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userData = {
        full_name: user.full_name || '',
        email: user.email || '',
        company: user.company || '',
        phone: user.phone || ''
      };
      setFormData(userData);
      setOriginalData(userData);
      setLoading(false);
    }
  }, [user]);

  // Check if form has changes
  useEffect(() => {
    if (!loading) {
      const changed = Object.keys(formData).some(
        key => formData[key] !== originalData[key]
      );
      setHasChanges(changed);
    }
  }, [formData, originalData, loading]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous messages
    setSuccess('');
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await Request.profile.update(formData);
      
      // Update user in auth context
      if (response.data.success) {
        updateUser(response.data.user);
        setOriginalData({...formData});
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    setFormData({...originalData});
    setSuccess('');
    setError('');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!formData.full_name) return 'U';
    
    const nameParts = formData.full_name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p className="subtitle">Manage your personal information</p>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <p>{success}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">!</span>
          <p>{error}</p>
        </div>
      )}
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {getInitials()}
            </div>
            <h3>{formData.full_name || 'User'}</h3>
            <p className="email">{formData.email}</p>
          </div>
          
          <div className="sidebar-actions">
            <button 
              className="password-button"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </div>
        
        <div className="profile-form-container">
          <h2>Personal Information</h2>
          
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  disabled // Email cannot be changed directly
                />
                <p className="input-hint">Contact support to change your email address</p>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company (Optional)</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={!hasChanges || saving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="save-button"
                disabled={!hasChanges || saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
          
          <div className="account-info">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Account Created</span>
                <span className="info-value">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Update</span>
                <span className="info-value">{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Type</span>
                <span className="info-value account-badge">{user.role || 'User'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)} 
        />
      )}
    </div>
  );
};

export default Profile;