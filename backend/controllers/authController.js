import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import validator from 'validator';

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.SECRET_KEY || process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_hotel_otp';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_hotel_otp';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'public_key_hotel_otp';
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    try {
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          user_name: user.name,
          email: user.email,
          otp: rawOtp,
          project_name: 'Hotel Management System',
        },
        ...(privateKey ? { accessToken: privateKey } : {}),
      });
    } catch (emailErr) {
      console.warn('Backend EmailJS send warning:', emailErr.message);
    }

    res.status(201).json({
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: user.email,
      requireOtp: true,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role !== 'customer' && user.employeeDetails?.status === 'inactive') {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact Admin.' });
    }

    const token = generateToken(user._id, user.role);

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({  
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      employeeDetails: user.employeeDetails,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);

    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_hotel_otp';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_hotel_otp';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'public_key_hotel_otp';
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    try {
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          user_name: user.name,
          email: user.email,
          otp: rawOtp,
          project_name: 'Hotel Management System',
        },
        ...(privateKey ? { accessToken: privateKey } : {}),
      });
    } catch (emailErr) {
      console.warn('Backend EmailJS send warning:', emailErr.message);
    }

    res.status(200).json({
      message: 'OTP generated successfully',
      otp: rawOtp,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Generate OTP Error:', error);
    res.status(500).json({ message: 'Server error generating OTP', error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Invalid request or OTP not requested' });
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.toString(), user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP code' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      employeeDetails: user.employeeDetails,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
  }
};
