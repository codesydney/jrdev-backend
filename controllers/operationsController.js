const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Offer = require('../models/offerModel');
const Task = require('../models/taskModel');
const Email = require('../email');

// @desc  Recruiter wants to create an offer against a task
// @route POST /api/v1/tasks/:id/offers
// @access Private

exports.acceptOffer = async (req, res) => {
  const { taskId, offerId } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Invalid Task');
  }
  if (task.status !== 'open') {
    throw new Error(
      `An offer can only be accepted on a task with 'open' status - this task has '${task.status}' status`
    );
  }

  const offer = await Offer.findOne({ _id: offerId, task: taskId });
  if (!offer) {
    throw new Error(
      `There is no such offer: ${offerId} on the task: ${taskId}`
    );
  }

  // validate if candidate has a credit card setup
  const paymentMethods = await stripe.paymentMethods.list({
    candidate: task.candidateId,
    type: 'card',
  });

  if (paymentMethods.data.length === 0) {
    throw new Error(
      `No credit card setup for the candidate: ${task.candidateId}. Please setup one in order to proceed.`
    );
  }

  // processing (start)
  task.status = 'assigned';
  task.acceptedOffer = offer;
  task.save({ validateBeforeSave: false });

  offer.status = 'accepted';
  offer.save();

  await Offer.updateMany(
    { task: taskId, _id: { $ne: offerId } },
    { status: 'outbidded' }
  );
  // processing (end)

  res.status(201).json({
    status: 'success',
    data: {
      success: true,
      task,
    },
  });
};

// exports.acceptOffer = async (req, res) => {
//   const { conn } = process.env;
//   console.log('my connection object: ', conn);
//   const session = await conn.startSession();

//   try {
//     const { taskId, offerId } = req.body;

//     const task = await Task.findOne({ _id: taskId, status: 'open' });
//     if (!task) {
//       throw new Error("Task should exist and with a 'open' status");
//     }

//     const offer = await Offer.findOne({ _id: offerId, task: taskId });
//     if (!offer) {
//       throw new Error(
//         `Offer does not exist or exists but not an offer for the task: ${taskId}`
//       );
//     }

//     // processing (start)
//     session.startTransaction();

//     task.status = 'assigned';
//     task.acceptedOffer = offer;
//     task.save({ validateBeforeSave: false, session });

//     offer.status = 'accepted';
//     offer.save({ session });

//     const outbiddedOffers = await Offer.updateMany(
//       { task: taskId, _id: { $ne: offerId } },
//       { status: 'outbidded' },
//       { session }
//     );

//     await session.commitTransaction();
//     // processing (end)

//     res.status(201).json({
//       status: 'success',
//       data: {
//         success: true,
//         task,
//         offer,
//         outbiddedOffers,
//       },
//     });
//   } catch (err) {
//     res.send(err.message);
//   }

//   session.endSession();
// };

// @desc  Upload photo for the user
// @route POST /api/v1/uploadUserPhoto
// @access Private

exports.uploadUserPhoto = async (req, res, next) => {
  if (!req.files) {
    throw new Error('Please provide a photo to upload');
  }

  if (!req.files.photo) {
    throw new Error(`It seems like the user photo was sent using with another property name. 
      Please provide the image using the property: photo`);
  }

  if (req.files.photo.length > 1) {
    throw new Error('Can upload only a single photo for the user!');
  }

  const result = await cloudinary.uploader.upload(
    req.files.photo.tempFilePath,
    {
      use_filename: true,
      folder: 'users',
    }
  );
  const photo = result.secure_url;

  res.status(200).json({
    status: 'success',
    data: {
      photo,
    },
  });
};

// @desc  Upload task photos
// @route POST /api/v1/uploadTaskPhotos
// @access Private

exports.uploadTaskPhotos = async (req, res, next) => {
  if (!req.files) {
    throw new Error('Please provide a photo to upload');
  }

  if (!req.files.photos) {
    throw new Error(`It seems like the photos were sent using with another property name. 
      Please provide the images using the property: photos`);
  }

  let photos = [];

  if (Array.isArray(req.files.photos)) {
    ({ photos } = req.files);
  } else {
    photos.push(req.files.photos);
  }

  photos = await Promise.all(
    photos.map(async photo => {
      const result = await cloudinary.uploader.upload(photo.tempFilePath, {
        use_filename: true,
        folder: 'tasks',
      });
      return result.secure_url;
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      photos,
    },
  });
};

// @desc  Upload sample photos that the app might need e.g. default user photo, other banners etc
// @route POST /api/v1/uploadSamplePhotos
// @access Private

exports.uploadSamplePhotos = async (req, res, next) => {
  if (!req.files) {
    throw new Error('Please provide a photo to upload');
  }

  let photos = [];

  if (Array.isArray(req.files.photos)) {
    ({ photos } = req.files);
  } else {
    photos.push(req.files.photos);
  }

  photos = await Promise.all(
    photos.map(async photo => {
      const result = await cloudinary.uploader.upload(photo.tempFilePath, {
        use_filename: true,
        folder: 'samples',
      });
      return result.secure_url;
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      photos,
    },
  });
};

// @desc  Candidate wants to release payment as the task has been completed
// @route POST /api/v1/releasePayment
// @access Private

exports.releasePayment = async (req, res) => {
  const { taskId } = req.body;

  const task = await Task.findById({ _id: taskId });
  if (!task) {
    throw new Error(`The task ${taskId} does not exist.`);
  }

  if (task.status !== 'completed' && task.status !== 'pay_decline') {
    throw new Error(
      `To release payment, the task ${taskId} needs to have 'completed' or 'pay_decline' status - currently has status: '${task.status}'`
    );
  }

  const { candidateId, acceptedOffer } = task;

  if (!acceptedOffer) {
    throw new Error(
      `Serious exception: For some reason, this task ${taskId} exists with 'completed' status, but still doesn't have an acceptedOffer attribute. Backend code needs to be investigated.`
    );
  }

  if (!candidateId) {
    throw new Error(
      `Serious exception: For some reason, this task ${taskId} exists without a candidateId. Backend code needs to be investigated.`
    );
  }

  // First retrieve payment method - only 1 credit card needs to be setup
  const paymentMethods = await stripe.paymentMethods.list({
    candidate: candidateId,
    type: 'card',
  });

  if (paymentMethods.data.length === 0) {
    throw new Error(
      `Please setup a credit card for the candidate: ${candidateId} in order to make payment.`
    );
  }

  if (paymentMethods.data.length > 1) {
    throw new Error(
      `It seems like more than 1 credit card has been setup for candidate: ${candidateId}. Only one needs to be setup.`
    );
  }

  // Next, create paymentIntents in Stripe
  const { client_secret } = await stripe.paymentIntents.create({
    amount: acceptedOffer.offerAmt * 100,
    currency: 'aud',
    payment_method: paymentMethods.data[0].id,
    application_fee_amount: process.env.APPLICATION_FEE_AMOUNT, //TODO: 123 This needs to be finalised with IMS and then setup as an enviroment variable on hosted server
    candidate: task.candidateId,
    receipt_email: 'test@email.com',
    transfer_data: {
      destination: acceptedOffer.recruiterId,
    },
    metadata: { taskId },
  });

  res.status(200).json({
    status: 'success',
    data: {
      client_secret,
      payment_method: paymentMethods.data[0].id,
    },
  });
};

exports.stripeAccountWebhook = async (req, res) => {
  let event;

  // Verify the event came from Stripe
  const sig = req.headers['stripe-signature'];

  event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET
  );

  // Handle the event comehere
  switch (event.type) {
    case 'account.updated':
      const {
        id: recruiterId,
        business_profile: { name },
      } = event.data.object;

      const user = await User.findOne({ recruiterId });
      if (!user) {
        throw new Error(
          `Webhook - account.updated: Could not find the user : ${user._id} corresponding to recruiterId: ${account}`
        );
      }
      user.object = 'recruiter';
      user.recruiterBusinessName = name;
      await user.save({ validateBeforeSave: false });

      break;
    case 'account.application.authorized':
      const application = event.data.object;
      // Then define and call a function to handle the event account.application.authorized
      break;
    case 'account.external_account.created':
      const externalAccount = event.data.object;
      // Then define and call a function to handle the event account.external_account.created
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  // } catch (err) {
  //   // On error, log and return the error message
  //   console.log(`❌ Error message: ${err.message}`);
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }

  // Successfully constructed event
  res.json({ received: true });
};

exports.stripeWebhook = async (req, res) => {
  let event;

  // Verify the event came from Stripe
  const sig = req.headers['stripe-signature'];

  event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  await updateTaskPayStatus(event);

  // Successfully constructed event
  res.json({ received: true });
};

const updateTaskPayStatus = async event => {
  const { taskId } = event.data.object.metadata;
  const task = await Task.findById(taskId);
  if (!task)
    throw new Error(
      `Webhook - updateTaskPayStatus error: Could not find the task: ${taskId} to update it with status pertaining to: ${event.type}`
    );

  const user = await User.findOne({ candidateId: task.candidateId });
  if (!user)
    throw new Error(
      `Webhook - updateTaskPayStatus error: Could not find user document corresponding to candidateId: ${candidateId} for task: ${taskId}`
    );
  const { firstName, email } = user;

  const objData = event.data.object.charges.data[0];
  const {
    amount,
    application_fee_amount,
    payment_method_details: {
      card: { network, last4 },
    },
  } = objData;

  const amountPayable = (amount + application_fee_amount) / 100;
  const paymentData = {
    taskTitle: task.details,
    amountPayable,
    network,
    last4,
  };
  const url = process.env.MIGRAM_URL;

  switch (event.type) {
    case 'payment_intent.succeeded':
      task.status = 'paid';
      // await new Email({ email, firstName }, url).sendPaymentSuccessfulEmail(
      //   paymentData
      // );
      break;
    case 'payment_intent.payment_failed':
      task.status = 'pay_decline';
      // await new Email({ email, firstName }, url).sendPaymentUnsuccessfulEmail(
      //   paymentData
      // );
      break;
    case 'payment_intent.processing':
      task.status = 'pay_in_processing';
      // await new Email({ email, firstName }, url).sendPaymentInProcessingEmail(
      //   paymentData
      // );
      break;
    // default:
    //   console.log(`Unhandled event type ${event.type}`);
  }
  await task.save({ validateBeforeSave: false });
};
