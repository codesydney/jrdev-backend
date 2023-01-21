const express = require('express');
require('express-async-errors'); // not used so far; will come back to this
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const cors = require('cors');

// Application-specific middleware
const error = require('./globalErrorHandler');
const AppError = require('./appError');
const User = require('./routes/userRoutes');
const Recruiter = require('./routes/recruiterRoutes');
const Candidate = require('./routes/candidateRoutes');
const taskRouter = require('./routes/taskRoutes');
const offerRouter = require('./routes/offerRoutes');
const operationsRouter = require('./routes/operationsRouter');

// swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
  })
);

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (
    req.originalUrl === '/api/v1/webhook' ||
    req.originalUrl === '/api/v1/accountWebhook'
  ) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.static('public'));
process.env.rootDir = __dirname;
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
    createParentPath: true,
    // limits: { fileSize: 2 * 1024 * 1024 }, //2Mb filesize limit - TODO: didn't work for multiple uploads & haven't checked for single file upload
  })
);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// app routes
app.use('/api/v1/users', User);
app.use('/api/v1/recruiters', Recruiter);
app.use('/api/v1/candidates', Candidate);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1', operationsRouter);

// app documentation route
app.get('/', (req, res) => {
  res.send('<h1>JRDEV APIs</h1><h2><a href="/api-docs">Swagger Documentation</a></h2>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//Global error handling middleware
app.use(error);

app.all('*', (req, res, next) => {  
  throw new AppError(`Unable to find ${req.originalUrl} on this server`, 404);
});

module.exports = app;
