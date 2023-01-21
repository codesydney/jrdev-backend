const express = require('express');
const router = express.Router({ mergeParams: true });

const { protect } = require('../controllers/authController');
const {
  getAllOffers,
  postOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

router.route('/').get(protect, getAllOffers).post(protect, postOffer);

router.route('/:id').put(protect, updateOffer).delete(protect, deleteOffer);

module.exports = router;
