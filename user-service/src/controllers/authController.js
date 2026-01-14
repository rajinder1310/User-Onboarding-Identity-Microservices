const { generateOTP } = require('../utils/otpGenerator');
const redisClient = require('../config/redis');
const { sendEvent } = require('../config/kafka');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserDTO = require('../dtos/userDTO');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHandler');
const { signToken } = require('../utils/jwtUtils');

/**
 * Register a new user
 * 1. Checks if email already exists
 * 2. Generates an OTP
 * 3. Hashes the password
 * 4. Temporarily stores user data in Redis (expires in 5 mins)
 * 5. Publishes 'send-otp' event to Kafka for email-service
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists in DB
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const otp = generateOTP();

    // Hash password before temporary storage
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      otp
    };

    // Store registration data in Redis with 5-minute expiration
    await redisClient.setEx(`registration:${email}`, 300, JSON.stringify(userData));

    // Send event to Kafka topic 'send-otp'
    await sendEvent('send-otp', { email, otp, name });

    sendSuccess(res, 200, 'OTP sent to email. Please verify to complete registration.');

  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and Create User
 * 1. Retrieves temporary data from Redis using email key
 * 2. Validates provided OTP against stored OTP
 * 3. Creates new User record in PostgreSQL
 * 4. Deletes temporary data from Redis
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const key = `registration:${email}`;
    const data = await redisClient.get(key);

    if (!data) {
      return next(new AppError('OTP expired or not found', 400));
    }

    const userData = JSON.parse(data);

    if (userData.otp !== otp) {
      return next(new AppError('Invalid OTP', 400));
    }

    // Create user in database
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_verified: true
    });

    // Cleanup Redis key
    await redisClient.del(key);

    const userResponse = new UserDTO(newUser);

    sendSuccess(res, 201, 'User registered successfully', { user: userResponse });

  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 * 1. Finds user by email
 * 2. Verifies password
 * 3. Generates JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user.id);

    const userResponse = new UserDTO(user);

    sendSuccess(res, 200, 'Logged in successfully', {
      token,
      user: userResponse
    });

    // NOTE: In a real microservice architecture, you might publish a 'user-login' event here
    // for analytics or security monitoring.

  } catch (error) {
    next(error);
  }
};

/**
 * Get User Profile
 * Protected route to get current user details
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    const userResponse = new UserDTO(user);
    sendSuccess(res, 200, 'User profile', { user: userResponse });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyOTP, login, getProfile };
