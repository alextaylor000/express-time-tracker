var express = require('express');
var db = require ('../db');
var router = express.Router();

var workSessionSchema = db.Schema({
  date: { type: Date, default: Date.now },
  totalHours: Number,
  rate: { type: Number, default: 25 }
});

var WorkSession = db.model('WorkSession', workSessionSchema);

/* find workSession for routes requiring the :id param */
router.param('id', function(req, res, next, id) {
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

router.get('/', function(req, res) {
  WorkSession.find({}, function(err, workSessions) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.send(workSessions);
    }
  });
});

router.get('/:id', function(req, res) {
  res.send(req.workSession);
});

router.post('/', function(req, res) {
  const workSession = new WorkSession(req.body);
  workSession.save(function(err, obj) {
    // TODO: promises might be a better way of handling this error/success stuff
    if (err) {
      res.status(422).send(err);
    } else {
      res.status(201).send({ id: workSession.id });
    }
  });
});

const update = function(req, res) {
  Object.assign(req.workSession, req.body);

  req.workSession.save(function(err, obj) {
    if (err) {
      res.status(422).send(err);
    } else {
      res.status(200).send(req.workSession);
    }
  })
}

router.put('/:id', update);
router.patch('/:id', update);

router.delete('/:id', function(req, res) {
  req.workSession.remove(function(err, obj) {
    if (err) {
      res.status(422).send(err);
    } else {
      res.status(200).send();
    }
  });
});

module.exports = router;
