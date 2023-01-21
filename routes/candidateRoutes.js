const express = require('express');

const { protect } = require('../controllers/authController');
const {
  postCandidate,
  getCandidate,
  postSetupIntent,
  updateCreditCard,
  detachCreditCard,
  getPaymentMethods,
  createCandidatePortalSession,
} = require('../controllers/candidateController');

const router = express.Router();

router.route('/').post(protect, postCandidate);
router.route('/create-candidate-portal-session').post(protect, createCandidatePortalSession);
router.route('/create-setup-intent').post(protect, postSetupIntent);
router.route('/:id').get(protect, getCandidate);
router.route('/:id/detachCreditCard').put(protect, detachCreditCard);
router.route('/:id/updateCreditCard').put(protect, updateCreditCard);
router.route('/:id/paymentMethods').get(protect, getPaymentMethods);

module.exports = router;
