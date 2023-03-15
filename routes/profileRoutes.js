const express = require('express');
const ProfileRouter = express.Router();
const { uploadResume } = require('../middleware/uploadFile');
const { requireAuth } = require('../middleware/requierAuth');

const {
  getAllProfiles,
  getProfilesById,
  createProfile,
} = require('../controllers/profileController');

ProfileRouter.get('/profile', requireAuth, getAllProfiles);
ProfileRouter.get('/profile/:id', requireAuth, getProfilesById);

ProfileRouter.post(
  '/profile',
  requireAuth,
  uploadResume.single('resume'),
  createProfile
);

module.exports = ProfileRouter;
