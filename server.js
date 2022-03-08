/* eslint-disable no-console */
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./middleware/logEvents');
const verifyJWT = require('./middleware/verifyJWT');

const PORT = process.env.PORT || 3500;

const connect = async () => {
  const dbUri = 'mongodb://mongo_db:27017/express_intro';

  try {
    await mongoose.connect(dbUri);
    console.log('DB connected');
  } catch (error) {
    console.log('Could not connected to DB');

    process.exit(1);
  }
};

app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookie credentials requirement
app.use(credentials);

// cors
app.use(cors(corsOptions));

// built-in middleware to handle urlencode model
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static files
app.use(express.static(path.join(__dirname, '/public')));

connect();

// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));

// catch all the routes
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

// write error log when some error come
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/* eslint-enable no-console */
