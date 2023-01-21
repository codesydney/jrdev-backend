const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

if (!process.env.JWT_SECRET) {
  console.log('FATAL ERROR: JWT_SECRET is not configured yet!');
  process.exit(2);
}
let db;
if (app.get('env') === 'development') {  
  //db = process.env.DATABASE_LOCAL;
  db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
} else {
  db = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
}

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to mongodb..............Yay!'))
  .catch(err => console.error('Error connecting to mongodb', err));

// start the webserver and listen on a port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Connected to Db: ${db}; webserver listening on port ${port}..`);
});
