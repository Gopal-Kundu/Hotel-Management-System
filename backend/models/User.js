import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'employee', 'customer'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    employeeDetails: {
      status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
      attendance: [
        {
          date: {
            type: Date,
            required: true,
          },
          status: {
            type: String,
            enum: ['present', 'absent'],
            default: 'present',
          },
        },
      ],
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
