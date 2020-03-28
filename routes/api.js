var express = require('express');
var comment = require('../models/comments');
var router = express.Router();

router.get('/', function(req, res, next) {
  comment.getAll(function(err, data) {
    if (err) {
      // error handling code goes here
      console.log('ERROR : ', err);
      res.sendStatus(err.status || 500);
      res.render('error');
    } else {
      // code to execute on data retrieval
      console.log('result from db is : ', data);
      res.json(data);
    }
  });
});

router.get('/create/:userId/:text', function(req, res, next) {
  comment.create(req.params.userId, req.params.text, function(err, data) {
    if (err) {
      // error handling code goes here
      console.log('ERROR : ', err);
      res.sendStatus(err.status || 500);
      res.render('error');
    } else {
      // code to execute on data retrieval
      console.log('result from db is : ', data);
      res.json({
        response: `Comment '${req.params.text}' by user:${req.params.userId} Successfully added to database`,
      });
    }
  });
});

module.exports = router;
