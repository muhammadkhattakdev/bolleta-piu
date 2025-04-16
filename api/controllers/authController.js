const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      full_name,
      email,
      password
    });

    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ valid: false });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    // Generate random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create reset token hash
    const resetToken = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
    
    // Add reset token to user document with expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();
    
    // Create email message
    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
      <p>Your verification code is: <strong>${resetCode}</strong></p>
      <p>This code is valid for 15 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Verification Code',
      html: message
    });
    
    res.status(200).json({
      success: true,
      message: 'Verification code sent to email'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify reset code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Hash the provided code
    const resetToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    
    // Find user with matching token and valid expiration
    const user = await User.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Check if token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = password;
    
    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, company, phone } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (full_name) user.full_name = full_name;
    if (company) user.company = company;
    if (phone) user.phone = phone;
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: Date.now()
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};