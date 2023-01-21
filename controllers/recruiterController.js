const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const User = require('../models/userModel');

// create account via hosted onboarding
exports.postRecruiter = async (req, res) => {
  // Validate user
  let user = await User.findById({ _id: req.body.UserId });
  if (!user) throw new Error('Invalid user');

  if (user.object && user.object === 'candidate') {
    throw new Error(
      `Invalid operation: A user can only be setup as  a candidate or recruiter. This user is already setup as a candidate`
    );
  }

  // create a new recruiter in Stripe only if the user is not a recruiter already
  // else just allow onboading form for the existing recruiter
  let account;
  let recruiterExistsForUser = user.recruiterId;

  if (recruiterExistsForUser) {
    account = await stripe.accounts.update(user.recruiterId, {
      metadata: { userId: user.name }, // TO DO: could not store objectId user._id
      external_account: {
        object: 'bank_account',
        country: 'AU',
        currency: 'AUD',
        account_holder_name: 'Test account holder',
        account_number: '000123456',
        routing_number: '110000',
      },
    });
  } else {
    // Create "blank" custom account
    account = await stripe.accounts.create({
      type: 'custom',
      business_type: 'company',
      requested_capabilities: ['card_payments', 'transfers'],
      metadata: { userId: user.name },
      external_account: {
        object: 'bank_account',
        country: 'AU',
        currency: 'AUD',
        account_holder_name: 'Test account holder',
        account_number: '000123456',
        routing_number: '110000',
      },
    });

    // Update user object with the newly created recruiterId
    // user.recruiterId = account.id; <== didn't work, TO DO: need to research why
    user = await User.findByIdAndUpdate(
      { _id: req.body.UserId },
      { recruiterId: account.id },
      { new: true }
    );
  }

  const accountId = account.id;
  const type = recruiterExistsForUser ? 'account_update' : 'account_onboarding';

  // Create account link.
  console.log('message below');
  console.log(process.env.STRIPE_RETURN_URL);
  const accountLink = await stripe.accountLinks.create({
    // account: account.id,
    account: accountId,
    return_url: process.env.STRIPE_RETURN_URL,
    refresh_url: process.env.STRIPE_REFRESH_URL,
    type,
    collect: 'eventually_due',
  });

  // return entire user object (which has the new recruiter id) and the accountLink
  res.status(201).json({
    status: 'success',
    data: {
      userId: user._id,
      recruiterId: accountId,
      accountLink,
    },
  });
};

// @desc  Recruiter wants to retrieve payouts
// @route GET /api/v1/recruiters/:id/payouts
// @access Private

exports.payouts = async (req, res) => {
  const { id: recruiterId } = req.params;

  // Validate user
  const user = await User.findById(req.body.UserId);
  if (!user) throw new Error('Invalid user');

  if (user.recruiterId !== recruiterId) {
    throw new Error(
      `Provided recruiterId: ${recruiterId} is not mapped to the logged in user: ${user._id}.`
    );
  }

  const payouts = await stripe.payouts.list({
    destination: recruiterId,
    limit: 100, //TODO: get from the client, just like we do pagination for tasks
  });

  res.status(200).json({
    status: 'success',
    data: payouts,
  });
};
