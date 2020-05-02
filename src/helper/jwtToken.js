import jwt from 'jsonwebtoken';
import isEmpty from 'lodash/isEmpty';
import mongoose from 'mongoose';

import { constants } from '../constants';
import User from '../models/databaseModel/User';
import { db } from '../db';
import config from '../config/keys';

let responseObj = {
  status: 400,
  message: constants.controllerStatus.INVALID_TOKEN,
  error: [{ message: 'Auth token is invalid' }],
};

class JwtToken {
  validateToken = (req, res, next) => {
    try {
      let bearerHeader = req.headers['authorization'];
      if (bearerHeader.startsWith('Bearer ')) {
        // Remove Bearer from string
        const tokenFromHeaders = bearerHeader.split(' ')[1].trim();
        if (tokenFromHeaders) {
          jwt.verify(
            tokenFromHeaders,
            config.JWT_SECRET_KEY,
            async (err, token) => {
              if (err) {
                res.redirect(
                  process.env.NODE_ENV === 'development'
                    ? 'http://localhost:3000/sign_in'
                    : 'http://yourDomain.com/sign_in',
                );
                return res
                  .status(responseObj.status)
                  .send(responseObj);
              } else {
                /*console.log("====token-====",token) //decoded token
                    console.log("====token id-====",token._id)*/
                let user = await db.find(User, {
                  dbQuery: {
                    _id: mongoose.Types.ObjectId(token._id),
                  },
                });
                //console.log(user);

                const notExp =
                  token.exp - Math.floor(Date.now() / 1000) > 0;

                const authTokenFromDb = user.body[0].token.find(
                  item => item.tokenFor === 'authentication',
                );

                if (
                  !isEmpty(user.body) &&
                  notExp &&
                  !isEmpty(authTokenFromDb) &&
                  bearerHeader === authTokenFromDb.token
                ) {
                  //console.log(user)
                  req.user = user.body[0];
                  next();
                } else {
                  res.redirect(
                    process.env.NODE_ENV === 'development'
                      ? 'http://localhost:3000/sign_in'
                      : 'http://yourDomain.com/sign_in',
                  );
                  return res.send(responseObj);
                }
              }
            },
          );
        } else {
          return res.status(responseObj.status).send(responseObj);
        }
      } else {
        return res.status(responseObj.status).send(responseObj);
      }
    } catch (e) {
      return res
        .status(400)
        .json(
          constants.responseObjError(
            e,
            constants.controllerStatus.TOKEN_MISSING,
          ),
        );
    }
  };

  generateBearerToken = async id => {
    const token = await jwt.sign({ _id: id }, config.JWT_SECRET_KEY, {
      expiresIn: 60 * 60,
    }); // 1hr exp
    console.log(token);
    return `Bearer ${token}`;
  };
}

export const jwtToken = new JwtToken();
export default jwtToken;
