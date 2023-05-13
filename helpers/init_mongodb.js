const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGODB_URL, {
    dbName: process.env.DB_NAME,
  })
  .then(() => console.log('Mongodb Connected'))
  .catch((err) => console.log(err.message));

mongoose.connection.on('connected', () => {
  console.log('Mongoose Connected to DB');
});
mongoose.connection.on('error', (err) =>
  console.log(err.message)
);
mongoose.connection.on('disconnected', () =>
  console.log('Mongoose Connection is Disconnected')
);

// to disconnect db properly
// SIGINT is triggered when ctrl+c is clicked
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
