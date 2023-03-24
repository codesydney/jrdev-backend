const express = require('express');
const { uploadAvatar } = require('../middleware/uploadFile');
const {
  loginUser,
  signupUser,
  getUsers
} = require('../controllers/userControllers');

const router = express.Router();

//* signup Route
router.post('/signup', uploadAvatar.single('avatar'), signupUser);
router.post('/login', loginUser);
router.get('/', getUsers);

module.exports = router;
