const express = require('express');
const ProfileRouter = express.Router();
const { requireAuth } = require('../middleware/requierAuth');

const {
  createProfile,
  getAllProfiles,
} = require('../controllers/profileController');

ProfileRouter.get('/profile', getAllProfiles);
ProfileRouter.post('/profile', requireAuth, createProfile);

module.exports = ProfileRouter;
