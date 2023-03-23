/* eslint-disable no-unused-vars */
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const Cloudinary = require('../utils/cloundinary');

// Set up AvatarStrorage to multer middleware
const AvatarStorage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: {
    folder: 'jrDev_Avatar',
    format: async (req, file) => 'png',
    public_id: (req, file) => {
      // get the filename without extension
      const filename = file.originalname.split('.')[0];
      // generate a new uuid
      const uuid = uuidv4();
      return `${filename}_${uuid}`;
    }
  }
});

// Set up ResumeStorage to multer middleware
const ResumeStorage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: {
    folder: 'jrDev_Resume',
    format: async (req, file) => 'pdf',
    public_id: (req, file) => {
      // get the filename without extension
      const filename = file.originalname.split('.')[0];
      // generate a new uuid
      const uuid = uuidv4();
      // combine filename and uuid},
      return `${filename}_${uuid}`;
    }
  }
});

const uploadAvatar = multer({
  storage: AvatarStorage,
  limits: { fileSize: 1000000 }
});
const uploadResume = multer({
  storage: ResumeStorage,
  limits: { fileSize: 3000000 }
});
module.exports = { uploadAvatar, uploadResume };
