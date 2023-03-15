const User = require('../models/userModel');
const uploadFile = require('../middleware/uploadFile');
const cloudinary = require('../utils/cloundinary');
const jwt = require('jsonwebtoken');

// * create Token
const createToken = _id => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    // create a token
    const token = createToken(user._id);
    const id = user._id;

    res.status(200).json({ status: 'succses', email, token, id, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password, firstName, lastName, city, phone } = req.body;
  let avatarUrl = '';
  try {
    if (req.file) {
      //upload avatar to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      avatarUrl = result.secure_url;
    }
    const user = await User.signup(
      email,
      password,
      firstName,
      lastName,
      city,
      phone,
      avatarUrl
    );
    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token, status: 'success' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signupUser, loginUser };
