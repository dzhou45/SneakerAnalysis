var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db = require('./db');
var cors = require('cors');
var helmet = require('helmet');
// Discord Passport
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');

var indexRouter = require('./routes/index');
var testAPIRouter = require('./routes/api');

var app = express();

// mysql db
// app.use('/comments', require('./controllers/comments'));
// app.use('/users', require('./controllers/users'));
db.connect(db.MODE_PRODUCTION, function() {
  db.get().getConnection((err, conn) => {
    if (err) {
      console.log('Unable to connect to MySQL.');
    } else {
      app.listen(3000, function() {
        console.log('Connected to Database...');
      });
    }
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet());

// discord-passport config
app.use(
  session({
    secret: 'express',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
var discordStrat = new DiscordStrategy(
  {
    clientID: '691896556261212211',
    clientSecret: '5LDqjvgsq_Nk2LWi4j3BBRCvXnk3DeGd',
    callbackURL: 'http://localhost:9000/auth',
    scope: ['identify', 'email', 'guilds'],
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
);
passport.use(discordStrat);
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', testAPIRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, '404 Not Found'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
