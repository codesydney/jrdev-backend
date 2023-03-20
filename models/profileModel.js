const mongoose = require('mongoose');

const profileSchemas = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  about: {
    type: String,
    maxlength: 200,
    required: false,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
    required: true,
  },
  yrsOfExpCoding: {
    type: Number,
    required: true,
  },
  education: {
    type: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    required: true,
    default: [],
  },
  codeSydneyBadge: {
    type: [String],
    default: [],
    required: true,
  },
  resume: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    originalname: {
      type: String,
      required: true,
    },
  },
  portfolioLink: {
    type: String,
    default: '',
    required: false,
  },
  githubLink: {
    type: String,
    default: '',
    required: false,
  },
  linkedinLink: {
    type: String,
    default: '',
    required: false,
  },
});

module.exports = mongoose.model('Profile', profileSchemas);
