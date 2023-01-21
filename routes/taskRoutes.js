const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const offerRouter = require('./offerRoutes');

// TODO: Comment off (See comments below)
// const offerRouter = require('./offerRoutes');
// const dialogueThreadRouter = require('./dialogueThreadRoutes');

const {
  getAllTasks,
  getTask,
  postTask,
  updateTask,
  deleteTask,
  markTaskComplete,
} = require('../controllers/taskController');

// TODO: If [GET] /task is able to get offers and threads, why do you provide the below 2 endpoints? Evaluate and remove if needed
// router.use('/:taskId/offers', offerRouter);
// router.use('/:taskId/threads', dialogueThreadRouter);

router.route('/').get(protect, getAllTasks).post(protect, postTask);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.route('/:id/completed').patch(protect, markTaskComplete);

router.use('/:taskId/offers', offerRouter);

module.exports = router;

//===========Do this after you're done with basic API implementation=======================
// AA //
// Find all ways tasks (URL endpoints) will be accessed
// Also define their access levels; for e.g.
// a) user doesn't need to be logged in to view the tasks
// b) user need to be logged (and possibly also a candidate) in order to create, update or delete a task.

// BB //
//middlewares for
// async, error, route handlers (factory functions)

// CC //
// getting user from logged in user
//=========================================================================================
