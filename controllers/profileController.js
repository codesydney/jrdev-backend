const Profile = require('../models/profileModel');
const uploadFile = require('../middleware/uploadFile');
const cloudinary = require('../utils/cloundinary');

//Get All candidate's profile
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

//Create candidate's profile
const createProfile = async (req, res) => {
  const user = req.user;
  if (!user.profile) {
    const {
      about,
      skills,
      education,
      codeSyneyBadge,
      resume,
      portfolioLink,
      githubLink,
      linkedinLink,
    } = req.body;

    try {
      const newPortfolio = await Profile.create({
        user: user._id,
        about,
        skills,
        education,
        codeSyneyBadge,
        resume,
        portfolioLink,
        githubLink,
        linkedinLink,
      });
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

module.exports = { getAllProfiles, createProfile };
