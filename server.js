const userRoutes = require('./routes/userRoutes');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const port = process.env.PORT || 3004;
const app = express();

morgan.token('req-data', req => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ':method :url :status :res[content-length] :req-data - :response-time ms'
  )
);
//* middleware
app.use(express.json());

app.use(cors());

// uploadFile middleware
// app.use(uploadFile);

app.use('/api/user', userRoutes);

//* connect to the DB
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  })
  .catch(error => {
    console.log(error);
  });
