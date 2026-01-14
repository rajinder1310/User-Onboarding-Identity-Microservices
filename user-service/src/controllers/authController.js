const { generateOTP } = require('../utils/otpGenerator');
const redisClient = require('../config/redis');
const { sendEvent } = require('../config/kafka');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserDTO = require('../dtos/userDTO');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHandler');
const { signToken } = require('../utils/jwtUtils');

const register = async (req, res, next) => {
  try {console.log(req.body)
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const otp = generateOTP();

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      otp
    };

    await redisClient.setEx(`registration:${email}`, 300, JSON.stringify(userData));

    await sendEvent('send-otp', { email, otp });

    sendSuccess(res, 200, 'OTP sent to email. Please verify to complete registration.');

  } catch (error) {
    next(error);
  }
};

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

    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      is_verified: true
    });

    await redisClient.del(key);

    sendSuccess(res, 201, 'User registered successfully', { user: userResponse });

  } catch (error) {
    next(error);
  }
};



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

  } catch (error) {
    next(error);
  }
};

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
