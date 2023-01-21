const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/userModel');
const path = require('path');
const cloudinary = require('cloudinary').v2;

exports.getUser = async (req, res) => {
  // need to return a not found if a user is not found
  let user = await User.findById(req.params.id);
  if (!user) throw new Error('Invalid user');

  const {
    id,
    object, // identifies if the user is a candidate or recruiter
    firstName, // candidate
    lastName, // candidate
    recruiterBusinessName, // recruiter
    photo,
    email,
    candidateId,
    recruiterId,
  } = user;

  user = {
    id,
    object,
    firstName,
    lastName,
    recruiterBusinessName,
    photo,
    email,
    candidateId,
    recruiterId,
  };

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};

// @desc  Update details of the user
// @route Put /api/v1/users:userId
// @access Private

exports.updateUser = async (req, res, next) => {
  try {
    if (req.files) {
      if (req.files.photo.length > 1)
        throw new Error('Can upload only a single photo for the user!');

      const result = await cloudinary.uploader.upload(
        req.files.photo.tempFilePath,
        {
          use_filename: true,
          folder: 'users',
        }
      );
      req.body.photo = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) throw new Error('Could not find the user');

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
