const mongoose = require('mongoose');
const utils = require('../utils');

const offerSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    recruiterId: {
      type: String,
      required: true,
    },
    offerAmt: {
      type: Number,
      required: [true, 'Offer amount is required.'],
      min: [5, 'A minimum offer amount of $5 is required.'],
    },
    comments: {
      type: String,
      minlength: [25, 'Comments must have at least 25 characters'],
      maxlength: [1500, 'Comments must have at max of 1500 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'accepted', 'outbidded', 'completed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*-*/
// offerSchema.pre(/^find/, function () {
//   this.populate({ path: 'recruiter', select: 'name photo ratings -_id' });
// });

offerSchema.virtual('timeElapsed').get(utils.timeElapsed);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
