const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// eslint-disable-next-line consistent-return
const requireAuth = async (req, res, next) => {
  // verify user is authenticated
  const { authorization } = req.headers;
  console.log('ab', req.headers);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    if (!_id) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    const user = await User.findById({ _id });
    if (!user) {
      return res.status(401).json({ error: 'User not in database' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = { requireAuth };
