const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const path = require('path');
const Email = require('../email');

// const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);
const signToken = payload => jwt.sign(payload, process.env.JWT_SECRET);

exports.signUp = async (req, res) => {
  if (req.body.password !== req.body.passwordConfirm) return res.status(400).json(
    {
      status: "error",
      message: "Invalid input data. Passwords must match",
    }
  )

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // photo: path.join('images', 'users', 'blank-profile.png'),
    photo:
      'https://res.cloudinary.com/dxd5elnem/image/upload/c_thumb,w_200,g_face/v1633225891/users/blank-profile.png',
  });

  // I saw that if the below line errors in runtime
  // (it works now after some fix)
  // the User.create has already been committed to the db
  // TO DO: Must try to roll back
  // const token = signToken(newUser._id);
  const token = signToken({ id: newUser._id });

  // const url = 'https://www.migram.com.au/';
  // await new Email({ email: req.body.email }, url).sendWelcome();

  res.header('x-auth-token', token);
  res.status(201).json({
    status: 'success',
    data: { user: newUser, token },
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Invalid email or password');
  }
  // user with email should exist
  let user = await User.findOne({ email });
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).send('Invalid user or password');
  }
  const { id, objectType, firstName, lastName, photo, candidateId, recruiterId } =
    user;

  newUser = {
    id,
    objectType,
    firstName,
    lastName,
    photo,
    email,
    candidateId,
    recruiterId,
  };

  // const token = signToken(user._id);
  // TODO: Do destructuring for below - maybe here - const user = await User.findOne({ email });
  const token = signToken({
    id: user._id,
  });
  res.header('x-auth-token', token);
  res.status(200).json({
    status: 'success',
    data: { user: newUser, token },
  });
};

exports.protect = async (req, res, next) => {
  // check if token exists in the request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .send('You are not logged in! Please log in to get access.');
  }
  // verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // does the user still exist
  const user = await User.findById(decoded.id);
  if (!user) {
    return res
      .status(401)
      .send('The user belonging to this token does not exist!');
  }

  // to do: was the password changed after the token was issued i.e. someone stole the token and
  // the user immedialey changed the password to mitigate risk

  // to pass the user
  req.body.UserId = user.id;
  req.body.candidateId = user.candidateId;
  req.body.recruiterId = user.recruiterId;

  next();
};
