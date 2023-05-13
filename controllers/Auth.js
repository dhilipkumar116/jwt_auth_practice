const UserModel = require('../models/User');
const httperrors = require('http-errors');
const { authSchema } = require('../helpers/validate_schema');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../helpers/jwt_token');
const jwt_token = require('../helpers/jwt_token');
const client = require('../helpers/init_redis');

exports.login = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await UserModel.findOne({
      email: result.email,
    });
    if (!user) {
      throw httperrors.NotFound('user not registered');
    }

    const isMatch = await user.isValidPassword(result.password);
    if (isMatch) {
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
      res.send({ accessToken, refreshToken });
    } else {
      throw httperrors.Unauthorized('password is incorrect');
    }
  } catch (error) {
    if (error.isJoi === true) {
      next(httperrors.BadRequest('Invalid email/password'));
    }
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const exist = await UserModel.findOne({
      email: result.email,
    });
    if (exist) {
      throw httperrors.Conflict(
        `${result.email} is has been already registered.`
      );
    }
    const user = UserModel(result);
    const saveduser = await user.save();
    const accessToken = await signAccessToken(saveduser.id);
    const refreshToken = await signRefreshToken(saveduser.id);
    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi == true) {
      error.status = 422;
    }
    next(error);
  }
};

exports.refresh_token = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw httperrors.BadRequest();
    }
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refresh_token = await signRefreshToken(userId);
    res.send({ accessToken, refreshToken: refresh_token });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw httperrors.BadRequest();
    }
    const userId = await verifyRefreshToken(refreshToken);
    client.del(userId);
    res.status(204).send('logout sucessful');
  } catch (error) {
    next(error);
  }
};
