var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var readinessRouter = require('./routes/readiness');      // NEW
var destinationsRouter = require('./routes/destinations'); // NEW
var itineraryRouter = require('./routes/itinerary');       // NEW

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Handlebars helpers
var hbs = require('hbs');
hbs.registerHelper('json', obj => JSON.stringify(obj, null, 2));
hbs.registerHelper('sub', (a, b) => a - b);
hbs.registerHelper('isActive', (path, currentPath) => {
  if (path === '/' && currentPath === '/') return 'active';
  if (path !== '/' && currentPath.startsWith(path)) return 'active';
  return '';
});
app.use((req, res, next) => { 
  res.locals.requestHost = req.protocol + '://' + req.get('host');
  res.locals.currentPath = req.path;
  next(); 
});

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(readinessRouter);
app.use('/destinations', destinationsRouter);
app.use(itineraryRouter);

// Healthcheck
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    status: err.status || 500,
    stack: req.app.get('env') === 'development' ? err.stack : null
  });
});

module.exports = app;
