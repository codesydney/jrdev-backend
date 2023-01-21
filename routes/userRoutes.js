const express = require('express');
const { signUp, login } = require('../controllers/authController');
const { getUser, updateUser } = require('../controllers/userController');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.route('/signUp').post(signUp);
router.route('/login').post(login);
router.route('/:id').get(protect, getUser).put(protect, updateUser);

module.exports = router;
