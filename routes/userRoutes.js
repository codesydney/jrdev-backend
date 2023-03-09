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

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'images');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//   if (allowedFileTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// let uploadFile = multer({ storage, fileFilter });

//* signup Route
router.post('/signup', uploadFile.single('avatar'), signupUser);
router.post('/login', loginUser);
router.get('/test', getUsers);

module.exports = router;
