const multer = require('multer');
const path = require('path');
const cloudinary = require('../utils/cloundinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Set up multer middleware to handle FormData
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jrDev_Avatar',
    format: async (req, file) => 'png',
    public_id: (req, file) => file.filename,
  },
});

const ResumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jrDev_Resume',
    format: async (req, file) => 'pdf',
    public_id: (req, file) => file.filename,
  },
});

const uploadFile = multer({ storage: storage, limits: { fileSize: 1000000 } });
const uploadResume = multer({
  storage: ResumeStorage,
  limits: { fileSize: 3000000 },
});
module.exports = { uploadFile, uploadResume };
