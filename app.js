const express = require('express');
const morgan = require('morgan');
const httperrors = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb');
require('./helpers/init_redis');
const authRouter = require('./routes/Auth.js');
const { verifyAccessToken } = require('./helpers/jwt_token');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', verifyAccessToken, async (req, res) => {
  console.log(req.payload);
  res.send('hello world');
});
app.use('/auth', authRouter);
app.use(async (req, res, next) => {
  next(httperrors.NotFound('this route does not exist'));
});

app.use(async (err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on ${PORT}...`);
});
