const multer = require('multer');
const path = require('path');
const cloudinary = require('../utils/cloundinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up AvatarStrorage to multer middleware
const AvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jrDev_Avatar',
    format: async (req, file) => 'png',
    public_id: (req, file) => file.filename,
  },
});

// Set up ResumeStorage to multer middleware
const ResumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jrDev_Resume',
    format: async (req, file) => 'pdf',
    public_id: (req, file) => file.filename,
  },
});

const uploadAvatar = multer({
  storage: AvatarStorage,
  limits: { fileSize: 1000000 },
});
const uploadResume = multer({
  storage: ResumeStorage,
  limits: { fileSize: 3000000 },
});
module.exports = { uploadAvatar, uploadResume };
