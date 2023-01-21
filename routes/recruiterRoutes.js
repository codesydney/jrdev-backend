const express = require('express');

const { protect } = require('../controllers/authController');
const { postRecruiter, payouts } = require('../controllers/recruiterController');

const router = express.Router();

router.route('/').post(protect, postRecruiter);
router.route('/:id/payouts').get(protect, payouts);

module.exports = router;
