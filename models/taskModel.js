const mongoose = require('mongoose');
const utils = require('../utils');

const taskSchema = new mongoose.Schema(
  {
    candidateId: {
      type: String,
      required: [
        true,
        'This user needs to be made a candidate in order to proceed with creating a task.',
      ],
    },
    category: {
      type: String,
      required: [true, 'A task category is required.'],
      enum: {
        values: ['Cleaning', 'Gardening', 'Lawn Mowing', 'Painting'],
        message: `Valid values for category are: 'Cleaning', 'Gardening', 'Lawn Mowing', 'Painting'`,
      },
    },
    title: {
      type: String,
      required: [true, 'Task name is required!'],
      minlength: [10, 'A title must have at least 10 characters'],
      trim: true,
    },
    details: {
      type: String,
      required: [true, 'Task details are required.'],
      minlength: [25, 'Details must have at least 25 characters'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'A budget is required.'],
      min: [5, 'Budget should be at least a minimum of $5'],
      // TODO: confirm with Hussam what the min value should be
    },
    timeOfArrival: {
      type: String,
      enum: {
        values: ['7am-10am', '10am-1pm', '1pm-4pm', '4pm-7pm'],
        message: `Valid values for timeOfArrival are: '7am-10am', '10am-1pm', '1pm-4pm', '4pm-7pm'`,
      },
      required: [true, 'Time of arrival is required'],
    },
    timeEstimate: {
      type: String,
      enum: {
        values: ['1-3hrs', '4-6hrs', '6-8hrs', 'moreThan1Day'],
        message: `Valid values for timeEstimate are: '1-3hrs', '4-6hrs', '6-8hrs', 'moreThan1Day'`,
      },
      required: [true, 'Time estimate is required'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          'open',
          'assigned',
          'completed',
          'paid',
          'pay_decline',
          'pay_in_processing',
        ],
        message: `Valid values for status are: 'open','assigned','completed','paid','pay_decline','pay_in_processing',`,
      },
      default: 'open',
    },
    dueDate: {
      type: Date,
      validate: {
        validator: due => new Date(due) >= new Date(),
        message: `Due date {VALUE} cannot be lesser than today`,
      },
    },
    photos: [String],
    location: {
      name: {
        type: String,
        required: [true, 'A task location address is required.'],
      },
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: Array,
        validate: {
          validator: v => v && v.length === 2, // how do we check if each of the 2 elements was a number?
          message: 'Both latitude and longitude needs to be provided.',
        },
      },
    },
    acceptedOffer: {
      type: Object,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
taskSchema.virtual('offers', {
  ref: 'Offer',
  foreignField: 'task',
  localField: '_id',
});

// taskSchema.virtual('threads', {
//   ref: 'Thread',
//   foreignField: 'task',
//   localField: '_id',
// });

/*-*/
taskSchema.pre(/find/, function () {
  this.populate({ path: 'candidate', select: 'name photo -_id' });
});
/*-*/

taskSchema.virtual('timeElapsed').get(utils.timeElapsed);

/*-*/

taskSchema.index({ location: '2dsphere' });
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
