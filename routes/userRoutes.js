const express = require('express');
// const multer = require('multer');
// let path = require('path');
const uploadFile = require('../middleware/uploadFile');
const {
  loginUser,
  signupUser,
  getUsers,
} = require('../controllers/userControllers');

const router = express.Router();

//* signup Route
router.post('/signup', uploadFile.single('avatar'), signupUser);
router.post('/login', loginUser);
router.get('/test', getUsers);

module.exports = router;
