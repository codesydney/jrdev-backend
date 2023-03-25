const express = require('express');
const { uploadAvatar } = require('../middleware/uploadFile');
const {
  loginUser,
  signupUser,
  verifyToken
} = require('../controllers/userControllers');
const { requireAuth } = require('../middleware/requierAuth');

const router = express.Router();

//* signup Route
router.post('/signup', uploadAvatar.single('avatar'), signupUser);
router.post('/login', loginUser);
router.get('/authentication', requireAuth, verifyToken);

module.exports = router;
