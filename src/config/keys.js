/* eslint-disable no-console */
require('dotenv').config();
console.log('fwdfsdfsdf', process.env.DATABASE);
module.exports = {
  DATABASE: process.env.DATABASE,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
