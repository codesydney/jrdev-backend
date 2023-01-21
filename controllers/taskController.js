const cloudinary = require('cloudinary').v2;
const Task = require('../models/taskModel');
const Offer = require('../models/offerModel');
const User = require('../models/userModel');
const path = require('path');

// @desc  Get all tasks
// @route GET /api/v1/tasks (should work for all tasks (Browse tasks) and tasks for the candidate); also unexpired tasks
// @access Public

exports.getAllTasks = async (req, res, next) => {
  let queryObj = {};
  let {
    my_tasks,
    category,
    status,
    min_price,
    max_price,
    latitude,
    longitude,
    distance,
    search,
    after_time,
  } = req.query;
  const radius = distance / 6378.1; // distance is assumed to be in kms

  if (my_tasks == 'true' && req.body.candidateId)
    queryObj.candidateId = req.body.candidateId;

  if (category) queryObj.category = category;
  if (status) queryObj.status = status;
  if (min_price) queryObj.budget = { $gte: parseInt(min_price) };
  if (max_price) queryObj.budget = { $lte: parseInt(max_price) };
  if (min_price && max_price)
    queryObj.budget = {
      $gte: parseInt(min_price),
      $lte: parseInt(max_price),
    };
  if (latitude && longitude && distance)
    queryObj.location = {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    };
  if (search) queryObj.title = new RegExp(search);
  if (!queryObj.title && search) queryObj.details = new RegExp(search);
  if (after_time) queryObj.createdAt = { $gte: new Date(after_time.trim()) };

  const query = Task.find(queryObj);

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 3;
  const skip = (page - 1) * limit;
  if (req.query.page) {
    const numTours = await Task.countDocuments();
    if (skip >= numTours) throw new Error('This page does not exist.');
  }
  query.skip(skip).limit(limit);

  // Execute query
  const tasks = await query;
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks,
    },
  });
};

// @desc  Create task for the candidate
// @route POST /api/v1/tasks
// @access Private

exports.postTask = async (req, res, next) => {
  const newTask = await Task.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      task: newTask,
    },
  });
};

// @desc  Get single task
// @route GET /api/v1/tasks/:id === Should use virtual population to retrive all offers, qns [basically load up all related stuff]
// @access Public

exports.getTask = async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  if (!task) throw new Error('Invalid task');

  // If this task has no accepted offer, then go ahead and show all the open (i.e. potential) offers
  if (!task.acceptedOffer) {
    const offers = await Offer.find({ task: task._id });

    task = {
      ...task.toObject(), //without .toObject(), it was returning some extra stuff - https://stackoverflow.com/questions/48014504/es6-spread-operator-mongoose-result-copy
      offers,
    };

    task.offers = await Promise.all(
      task.offers.map(async offer => {
        const user = await User.findOne({ recruiterId: offer.recruiterId });
        return {
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.photo,
          ...offer.toObject(),
        };
      })
    );
    task.numOfOffers = task.offers.length;
  }

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
};

// @desc  Update task for the candidate
// @route Put /api/v1/tasks:taskId
// @access Private

exports.updateTask = async (req, res, next) => {
  const { status } = req.body;
  if (status) {
    throw new Error(
      'Please note that status cannot be updated using this route. status gets updated as a result of other actions or explicity using the task/<taskId>/completed route'
    );
  }
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) throw new Error('Could not find the task');

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
};

// @desc  Delete task for the candidate
// @route DELETE /api/v1/tasks:taskId
// @access Private

exports.deleteTask = async (req, res, next) => {
  const { id: taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      status: 'fail',
      message: `Could not find the task: ${taskId}`,
    });
  }

  if (task.status !== 'open') {
    return res.status(400).json({
      status: 'fail',
      message: `Cannot delete task: ${taskId} as it has a status of '${task.status}' i.e. it is not an 'open' task!`,
    });
  }
  await Task.findByIdAndDelete(taskId);
  await Offer.deleteMany({ task: task._id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.markTaskComplete = async (req, res, next) => {
  // Is this logged in user a candidate? If yes, raise error. Only valid recruiter can attempt this
  const user = await User.findById(req.body.UserId);
  if (user.object === 'candidate') {
    throw new Error(
      `Invalid operation: It appears that this user: ${user._id} is a candidate. Only recruiter whom this task is assigned can attempt to complete the task.`
    );
  }

  const { id: taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error(`Could not find task with the id: ${taskId}`);
  }

  if (task.status !== 'assigned')
    throw new Error(
      `A task needs to have 'assigned' status for it to be marked as 'complete'- this task has '${task.status}' status`
    );

  if (
    task.status === 'assigned' &&
    task.acceptedOffer.recruiterId !== user.recruiterId
  ) {
    throw new Error(
      `Invalid operation: Only the recruiter whom this task is assigned can attempt to mark the task as complete.`
    );
  }

  task.status = 'completed';
  task.acceptedOffer.status = 'completed';
  task.save({ validateBeforeSave: false });

  const offer = await Offer.findById(task.acceptedOffer._id);
  offer.status = "completed";
  offer.save();

  res.status(200).json({
    status: 'success',
    data: {
      task,
    },
  });
};
