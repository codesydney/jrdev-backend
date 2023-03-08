const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// * create Token
const createToken = _id => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

const getUsers = async (req, res) => {
  const Users = await User.find();

  res.status(200).json(Users);
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
    res.status(400).json({ status: error.message });
  }
};

// signup a user
const signupUser = async (req, res) => {
  const { email, password, firstName, lastName, city, phone } = req.body;

  try {
    const user = await User.signup(
      email,
      password,
      firstName,
      lastName,
      city,
      phone
    );

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ email, token, status: 'success' });
  } catch (error) {
    res.status(400).json({ status: error.message });
  }
};

module.exports = { signupUser, loginUser, getUsers };
