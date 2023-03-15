const Profile = require('../models/profileModel');
const cloudinary = require('../utils/cloundinary');

// Get All candidate's profile
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', {
      firstName: 1,
      lastName: 1,
      avatar: 1,
      city: 1,
    });
    res.status(200).json({
      status: 'success',
      profiles,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get profile by user's Id
const getProfilesById = async (req, res) => {
  try {
    const userId = req.params.id;
    const profile = await Profile.findById(userId);
    res.status(200).json({
      status: 'success',
      profile,
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

// Create candidate's profile
const createProfile = async (req, res) => {
  const user = req.user;
  if (!user.profile) {
    const {
      about,
      skills,
      education,
      codeSyneyBadge,
      portfolioLink,
      githubLink,
      linkedinLink,
    } = req.body;
    let resumeUrl = '';
    try {
      if (req.file) {
        //upload resume in PDF format to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        resumeUrl = result.secure_url;
      }
      const newPortfolio = await Profile.create({
        user: user._id,
        about,
        skills,
        education,
        codeSyneyBadge,
        resume: resumeUrl,
        portfolioLink,
        githubLink,
        linkedinLink,
      });
      // Save profile to the specific user
      user.profile = newPortfolio._id;
      await user.save();
      res.status(201).json({ newPortfolio, status: 'success' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } else {
    return res.status(400).json({ error: 'Profile already exists' });
  }
};

module.exports = { getAllProfiles, getProfilesById, createProfile };
