const express = require('express');
const { register, verifyOTP } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, verifyOtpSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOTP);

module.exports = router;
