var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});


router.get('/welcome', function (req, res, next) {
  res.render('welcome', {
    username: req.cookies.username
  });
});

router.get('/story/:storyId', function (req, res, next) {
  res.send(`<h1>${req.params.storyId}</h1>`)
});


router.post('/process_login', function (req, res, next) {

  const password = req.body.password;
  const username = req.body.username;

  if (password === "a") {
    res.cookie('username', username);
    res.redirect('/welcome')
  } else {
    res.redirect('/login?msg=fail')
  }
});

router.get('/statement', function (req, res, next) {
  res.download(path.join(__dirname, 'userStatements/statement.png'))
});

router.get('/logout', function (req, res, next) {
  res.clearCookie('username');
  res.redirect('/login')
});

module.exports = router;