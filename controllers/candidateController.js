const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');

// Create & send paymentIntent to the client
exports.postSetupIntent = async (req, res) => {
  // Validate user
  const user = await User.findById({ _id: req.body.UserId });
  if (!user) throw new Error('Invalid user');

  if (!user.candidateId) {
    throw new Error(
      `No candidate associated to the user: ${user._id}. Please create a new candidate first.`
    );
  }

  // eslint-disable-next-line camelcase
  const { client_secret } = await stripe.setupIntents.create({
    candidate: user.candidateId,
    usage: 'on_session',
  });
  const CLIENT_PUBLISHABLE_KEY = process.env.CLIENT_PUBLISHABLE_KEY;
  res.json({ client_secret, CLIENT_PUBLISHABLE_KEY });
};

// Creates a URL for the User manage billing via the Stripe Candidate Portal
exports.createCandidatePortalSession = async (req, res) => { 
  const session = await stripe.billingPortal.sessions.create({
    candidate: req.body.candidateId,
    return_url: `${process.env.MIGRAM_URL}account/v2`,
  });

  res.json({
    data: { url: session.url }
  });
}

exports.postCandidate = async (req, res) => {
  // Validate user
  let user = await User.findById({ _id: req.body.UserId });
  if (!user) throw new Error('Invalid user');

  if (user.object && user.object === 'recruiter') {
    throw new Error(
      `Invalid operation: A user can only be setup as  a candidate or recruiter. This user is already setup as a recruiter`
    );
  }

  // create a new candidate in Stripe only if the user is not a candidate already
  // else just allow updates to the stripe candidate document
  let candidate;
  const candidateExistsForUser = user.candidateId;
  const candidateObj = { ...req.body };

  delete candidateObj.UserId;
  delete candidateObj.candidateId;
  delete candidateObj.recruiterId;

  if (candidateExistsForUser) {
    candidate = await stripe.candidates.update(user.candidateId, candidateObj);
  } else {
    candidate = await stripe.candidates.create(candidateObj);
  }

  // Filter out the fields that are of interest to the client
  candidate = {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    description: candidate.description,
    address: candidate.shipping.address,
  };

  // Update user object with the candidate fields that we're interested to kepp on the user document
  user = await User.findByIdAndUpdate(
    { _id: req.body.UserId },
    {
      candidateId: candidate.id,
      firstName: candidateObj.name.split(' ')[0],
      lastName: candidateObj.name.split(' ')[1],
      object: 'candidate',
    },
    { new: true }
  );

  res.status(201).json({
    status: 'success',
    data: {
      userId: user._id,
      candidate,
    },
  });
};

// @desc  Get a single candidate
// @route GET /api/v1/candidates/:id
// @access Private

exports.getCandidate = async (req, res) => {
  const { id: candidateId } = req.params;

  // Validate user
  const user = await User.findById(req.body.UserId);
  if (!user) throw new Error('Invalid user');

  console.log(user);
  console.log('user.candidateId: ', user.candidateId);
  console.log('candidateId: ', candidateId);

  if (user.candidateId !== candidateId) {
    throw new Error(
      `Provided candidateId: ${candidateId} is not mapped to the logged in user: ${user._id}.`
    );
  }

  let candidate;
  candidate = await stripe.candidates.retrieve(user.candidateId);

  // Filter out the fields that are of interest to the client
  candidate = {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    description: candidate.description,
    address: candidate.shipping.address,
  };

  res.status(200).json({
    status: 'success',
    data: { candidate },
  });
};

exports.getPaymentMethods = async (req, res) => {
  const { id: candidateId } = req.params;

  // Validate user
  const user = await User.findById(req.body.UserId);
  if (!user) throw new Error('Invalid user');

  if (user.candidateId !== candidateId) {
    throw new Error(
      `Provided candidateId: ${candidateId} is not mapped to the logged in user: ${user._id}.`
    );
  }

  const paymentMethods = await stripe.paymentMethods.list({
    candidate: candidateId,
    type: 'card',
  });

  const {
    id,
    card: { brand, exp_month, exp_year, last4 },
  } = paymentMethods.data[0];

  res.status(200).json({
    status: 'success',
    data: { card: { id, brand, exp_month, exp_year, last4 } },
  });
};

// @desc  Candidate wants to remove the credit card and replace with another
// @route POST /api/v1/candidates/:id/detachCreditCard
// @access Private

exports.detachCreditCard = async (req, res) => {
  const { id: candidateId } = req.params;

  // Validate user
  const user = await User.findById(req.body.UserId);
  if (!user) throw new Error('Invalid user');

  if (user.candidateId !== candidateId) {
    throw new Error(
      `Provided candidateId: ${candidateId} is not mapped to the logged in user: ${user._id}.`
    );
  }

  const paymentMethods = await stripe.paymentMethods.list({
    candidate: candidateId,
    type: 'card',
  });

  if (paymentMethods.data.length === 0) {
    throw new Error(
      `There is no credit card to delete for the candidate: ${candidateId}.`
    );
  }

  const paymentMethod = await stripe.paymentMethods.detach(
    paymentMethods.data[0].id
  );

  user.candidateCreditCard = undefined;
  user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// @desc  Candidate wants to remove the credit card and replace with another
// @route POST /api/v1/candidates/:id/updateCreditCard
// @access Private

exports.updateCreditCard = async (req, res) => {
  const { id: candidateId } = req.params;
  const { candidateCreditCard } = req.body;

  // Validate user
  const user = await User.findById(req.body.UserId);
  if (!user) throw new Error('Invalid user');

  if (user.candidateId !== candidateId) {
    throw new Error(
      `Provided candidateId: ${candidateId} is not mapped to the logged in user: ${user._id}.`
    );
  }

  if (
    !candidateCreditCard ||
    !(
      candidateCreditCard.substring(0, 4) === '....' &&
      parseInt(candidateCreditCard.substring(candidateCreditCard.length - 4))
    )
  ) {
    throw new Error(
      `candidateCreditCard: A valid credit card (....<last 4 digits>) e.g. '....4242' needs to be be provided for candidateId: ${candidateId}`
    );
  }

  user.candidateCreditCard = candidateCreditCard;
  user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};
