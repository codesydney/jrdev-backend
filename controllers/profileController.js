const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const uploadFile = require('../middleware/uploadFile');
const cloudinary = require('../utils/cloundinary');

//Get All candidate's profile
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', {
      firstName: 1,
      lastName: 1,
      avatar: 1,
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
  const userId = req.user;
  try {
    const newPortfolio = await Profile.create({
      user: userId,
      about,
      skills,
      education,
      codeSyneyBadge,
      resume,
      portfolioLink,
      githubLink,
      linkedinLink,
    });
    User.portfolio = user.portfolio.concat(newPortfolio._id);
    await User.Save();
    res.status(201).json({ newPortfolio, status: 'success' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllProfiles, createProfile };
