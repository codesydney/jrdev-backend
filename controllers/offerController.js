const Offer = require('../models/offerModel');
const Task = require('../models/taskModel');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Email = require('../email');

// @desc  Candidate wants to see all offers for his open task
// @route GET /api/v1/tasks/:id/offers
// @access Private

exports.getAllOffers = async (req, res, next) => {
  const queryObj = {};
  if (req.params.taskId) queryObj.task = req.params.taskId;

  if (req.query.my_offers === 'true' && req.body.recruiterId) {
    queryObj.recruiterId = req.body.recruiterId;
  }

  if (req.query.status) {
    queryObj.status = req.query.status;
  }

  const offers = await Offer.find(queryObj);
  res.status(200).json({
    status: 'success',
    results: offers.length,
    data: {
      offers,
    },
  });
};

// @desc  Recruiter wants to create an offer against a task
// @route POST /api/v1/tasks/:id/offers
// @access Private

exports.postOffer = async (req, res, next) => {
  // TODO: make a call to Stripe to check if recruiter is setup correctly. If NOT, don't proceed
  //'TODO: It appears that this recruiter is not setup correctly. Use the recruiter onboarding link to go to the Stripe onboarding form to resolve this issue'

  // validate task
  const task = await Task.findById(req.params.taskId);
  if (!task) throw new Error('Invalid task');

  // validate recruiter - gets validated in the candidate model for req.body.recruiterId

  // do not allow the recruiter to make a duplicate offer against the same task
  const duplicateOffer = await Offer.findOne({
    task: mongoose.Types.ObjectId(task._id),
    recruiter: req.body.recruiterId,
  });
  if (duplicateOffer)
    throw new Error('Duplicate offer from the same recruiter for this task');

  // grab taskId from query params and insert into the body as we need it in the offer document
  if (req.params.taskId) req.body.task = req.params.taskId;

  const newOffer = await Offer.create(req.body);

  // Get candidate's fields
  const custUser = await User.findOne({ candidateId: task.candidateId });
  if (!custUser)
    throw new Error(
      `Serious exception: For some reason, could not locate user document for task.candidateId: ${task.candidateId}`
    );
  const { firstName, email } = custUser;

  // Get recruiter's businessName
  const provUser = await User.findById(req.body.UserId);
  if (!provUser)
    throw new Error(
      `Serious exception: For some reason, the database shows that this user: ${req.body.UserId} hasn't been made a recruiter `
    );

  const offerData = {
    taskTitle: task.details,
    taskBudget: task.budget,
    dueDate: task.dueDate.toDateString(),
    offerAmt: newOffer.offerAmt,
    recruiterBusinessName: provUser.recruiterBusinessName,
  };
  const url = process.env.MIGRAM_URL;

  console.log(`1. exports.postOffer => taskTitle:  ${offerData.taskTitle}`);

  await new Email({ email, firstName }, url).sendNewOfferEmailToCandidate(
    offerData
  );

  res.status(201).json({
    status: 'success',
    data: {
      task: newOffer,
    },
  });
};

exports.updateOffer = async (req, res, next) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!offer) throw new Error('Could not find the offer');

  res.status(200).json({
    status: 'success',
    data: {
      offer,
    },
  });
};

// @desc  Delete task for the candidate
// @route DELETE /api/v1/tasks:taskId
// @access Private

exports.deleteOffer = async (req, res, next) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);

  if (!offer) throw new Error('Could not find the offer');

  res.status(200).json({
    status: 'success',
    data: null,
  });
};
