const JWT = require('jsonwebtoken');
const httperrors = require('http-errors');
const client = require('./init_redis');

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secretKey = process.env.ACCESS_TOKEN_SECRETE_KEY;
      const options = {
        expiresIn: '1m',
        issuer: 'dhilip.com',
        audience: userId,
      };
      JWT.sign(payload, secretKey, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(httperrors.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) {
      return next(httperrors.Unauthorized());
    }
    const token = req.headers['authorization'].split(' ')[1];
    JWT.verify(
      token,
      process.env.ACCESS_TOKEN_SECRETE_KEY,
      (err, payload) => {
        if (err) {
          console.log(err.message);
          const message =
            err.name === 'JsonWebTokenError'
              ? 'Unauthorized'
              : err.message;
          return next(httperrors.Unauthorized(message));
        }
        req.payload = payload;
        next();
      }
    );
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secretKey = process.env.REFRESH_TOKEN_SECRETE_KEY;
      const options = {
        expiresIn: '1y',
        issuer: 'dhilip.com',
        audience: userId,
      };
      JWT.sign(payload, secretKey, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(httperrors.InternalServerError());
        }
        client.set(userId, token);
        client.expire(userId, 365 * 24 * 60 * 60);
        return resolve(token);
      });
    });
  },
  verifyRefreshToken: (refresh_token) => {
    return new Promise((resolve, reject) => {
      const secretKey = process.env.REFRESH_TOKEN_SECRETE_KEY;
      JWT.verify(refresh_token, secretKey, (err, payload) => {
        if (err) {
          return reject(httperrors.Unauthorized());
        }
        const userId = payload.aud;
        client.get(userId).then((res) => {
          if (!res) {
            return reject(httperrors.Unauthorized());
          }
          if (res === refresh_token) {
            return resolve(userId);
          }
          return reject(httperrors.InternalServerError());
        });
      });
    });
  },
};
