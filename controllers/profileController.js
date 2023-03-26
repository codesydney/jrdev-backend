const Profile = require('../models/profileModel');
const cloudinary = require('../utils/cloundinary');

// Get All candidate's profile
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', {
      firstName: 1,
      lastName: 1,
      avatar: 1,
      city: 1
    });
    res.status(200).json({
      status: 'success',
      profiles
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
      profile
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};

// Create candidate's profile
const createProfile = async (req, res) => {
  const { user } = req;

  if (user && !user.profile) {
    const {
      about,
      skills,
      education,
      yrsOfExpCoding,
      codeSydneyBadge,
      portfolioLink,
      githubLink,
      linkedinLink
    } = req.body;
    const { filename, path, originalname } = req.file;
    try {
      const newPortfolio = await Profile.create({
        user: user._id,
        about,
        skills,
        education,
        yrsOfExpCoding,
        codeSydneyBadge,
        resume: { public_id: filename, url: path, originalname },
        portfolioLink,
        githubLink,
        linkedinLink
      });

      // Save profile to the specific user
      user.profile = newPortfolio._id;
      await user.save();
      return res.status(201).json({ newPortfolio, status: 'success' });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } else {
    return res.status(400).json({ error: 'Profile already exists' });
  }
};

// Update candidate's profile By Id
const updateProfile = async (req, res) => {
  const { user } = req;
  // Get the file information (public ID, URL, original name) from multer
  const { filename, path, originalname } = req.file;
  if (user && user.profile) {
    try {
      const {
        about,
        skills,
        education,
        yrsOfExpCoding,
        codeSydneyBadge,
        portfolioLink,
        githubLink,
        linkedinLink
      } = req.body;

      const updateFields = {
        about,
        skills,
        education,
        yrsOfExpCoding,
        codeSydneyBadge,
        portfolioLink,
        githubLink,
        linkedinLink
      };

      // If there is a new resume file, upload it to Cloudinary and return resumeURL
      if (req.file) {
        // Delete older resume from cloundinary while updating new one
        const olderResume = await Profile.findById(user.profile);
        if (olderResume && olderResume.resume) {
          const resumeId = olderResume.resume.public_id;
          if (resumeId) {
            await cloudinary.uploader.destroy(resumeId, (error, result) => {
              console.log(result, error);
            });
          }
        }
      }

      // Add the new resume file information to the update fields
      updateFields.resume = {
        public_id: filename,
        url: path,
        originalname
      };

      // Update the candidate's profile with the new fields
      const updatedProfile = await Profile.findByIdAndUpdate(
        user.profile,
        updateFields,
        { new: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      return res.status(200).json({ updatedProfile, status: 'success' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(400).json({ error: 'Profile does not exist' });
  }
};

module.exports = {
  getAllProfiles,
  getProfilesById,
  createProfile,
  updateProfile
};
