var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');        // ← you probably already have
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT
});

var app = express();

// Session (you probably have this already)
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24*60*60*1000 }
}));

// Make user available in templates + share DB connection
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  req.connection = connection;        // ← important for your controllers
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Your existing routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var contactRouter = require('./routes/contact');
var messagesRouter = require('./routes/messages');
var crudRouter = require('./routes/crud');
const varosokRouter = require('./routes/varosok');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/contact', contactRouter);
app.use('/messages', messagesRouter);
app.use('/crud', crudRouter);
app.use('/varosok', varosokRouter);

// ADD ONLY THIS ONE LINE
app.use('/', require('./routes/auth'));   // ← connects your Login/Register controllers

// Your protection middleware (keep exactly as you have it)
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.session.user || !roles.includes(req.session.user.role)) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  next();
};

app.use('/messages', requireRole(['admin', 'registered']), messagesRouter);
app.use('/crud',     requireRole(['admin']), crudRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app, connection };   // ← this fixes "app.set is not a function"