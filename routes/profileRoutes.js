const express = require('express');
const { uploadResume } = require('../middleware/uploadFile');
const { requireAuth } = require('../middleware/requierAuth');

const ProfileRouter = express.Router();

const {
  getAllProfiles,
  getProfilesById,
  createProfile,
  updateProfile
} = require('../controllers/profileController');

ProfileRouter.get('/profile', requireAuth, getAllProfiles);

ProfileRouter.get('/profile/:id', requireAuth, getProfilesById);

ProfileRouter.post(
  '/profile',
  requireAuth,
  uploadResume.single('resume'),
  createProfile
);

ProfileRouter.put(
  '/profile/:id',
  requireAuth,
  uploadResume.single('resume'),
  updateProfile
);

module.exports = ProfileRouter;
