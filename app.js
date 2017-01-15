var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var index = require('./routes/index');
var users = require('./routes/users');

// mongo stuff
mongoose.connect('mongodb://localhost/express-time-tracker');
var db = mongoose.connection;
var workSessionSchema = mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalHours: Number,
  rate: { type: Number, default: 25 }
});

var WorkSession = mongoose.model('WorkSession', workSessionSchema);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.param('id', function(req, res, next, id) {
  WorkSession.findById(id, function(err, workSession) {
    if (err) {
      next(err)
    } else if (workSession) {
      req.workSession = workSession
      next()
    } else {
      next(new Error('failed to load workSession'))
    }
  })
});

app.get('/work_sessions', function(req, res) {
  WorkSession.find({}, function(err, workSessions) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(workSessions);
    }
  });
});

app.get('/work_sessions/:id', function(req, res) {
  res.send(req.workSession);
});

app.post('/work_sessions', function(req, res) {
  const workSession = new WorkSession(req.body);
  workSession.save(function(err, obj) {
    if (err) {
      res.status(422).send(err);
    } else {
      res.status(201).send();
    }
  });
});

// catch 404 and forward to error handler
// these middleware are placed after the routes above so that any route not already handled will be caught by this function
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
