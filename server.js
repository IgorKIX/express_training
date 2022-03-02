/* eslint-disable no-console */
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');

const corsOptions = require('./config/corsOptions');
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./middleware/logEvents');

const PORT = process.env.PORT || 3500;

app.use(logger);

// cors
app.use(cors(corsOptions));

// built-in middleware to handle urlencode model
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

// serve static files
app.use(express.static(path.join(__dirname, '/public')));

// routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
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
