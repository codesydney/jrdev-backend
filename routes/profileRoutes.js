const express = require('express');
const ProfileRouter = express.Router();
const { uploadResume } = require('../middleware/uploadFile');
const { requireAuth } = require('../middleware/requierAuth');

const {
  createProfile,
  getAllProfiles,
} = require('../controllers/profileController');

ProfileRouter.get('/profile', getAllProfiles);
ProfileRouter.post(
  '/profile',
  requireAuth,
  uploadResume.single('resume'),
  createProfile
);

module.exports = ProfileRouter;
