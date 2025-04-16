const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  verifyToken,
  changePassword,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/verify', protect, verifyToken);

router.post('/change-password', protect, changePassword);

router.put('/profile', protect, updateProfile);

module.exports = router;