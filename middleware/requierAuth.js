const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// eslint-disable-next-line consistent-return
const requireAuth = async (req, res, next) => {
  // verify user is authenticated

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id });
    console.log('here0', req.user);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = { requireAuth };
