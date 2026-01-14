const express = require('express');
const { register, verifyOTP, login, getProfile } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, verifyOtpSchema, loginSchema } = require('../utils/validationSchemas');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', protect, getProfile);

module.exports = router;
