const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Invalid email id'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: 8,
    },
    photo: {
      type: String,
    },
    object: {
      type: String,
      enum: ['candidate', 'recruiter'],
    },
    candidateId: {
      type: String,
    },
    recruiterId: {
      type: String,
    },
    recruiterBusinessName: {
      type: String,
    },
    mobileNbr: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('email')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
