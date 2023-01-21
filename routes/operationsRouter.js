const express = require('express');

const router = express.Router();

const { protect } = require('../controllers/authController');
const {
  acceptOffer,
  releasePayment,
  uploadUserPhoto,
  uploadTaskPhotos,
  uploadSamplePhotos,
  stripeWebhook,
  stripeAccountWebhook,
} = require('../controllers/operationsController');

router.route('/acceptoffer').post(protect, acceptOffer);
// router.route('/releasepayment').post(protect, releasePayment);
router.route('/releasepayment').post(releasePayment);
router.route('/uploadUserPhoto').post(protect, uploadUserPhoto);
router.route('/uploadTaskPhotos').post(protect, uploadTaskPhotos);
router.route('/uploadSamplePhotos').post(protect, uploadSamplePhotos);
router
  .route('/webhook')
  .post(express.raw({ type: 'application/json' }), stripeWebhook);

router
  .route('/accountWebhook')
  .post(express.raw({ type: 'application/json' }), stripeAccountWebhook);

module.exports = router;
