const whitelist = require('./whiteList');

const corsOptions = {
  origin: (origin, callback) => {
    // eslint-disable-next-line no-console
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
