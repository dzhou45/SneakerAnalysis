var express = require('express');
var path = require('path');
var request = require('request');
var router = express.Router();
const passport = require('passport');
const db = require('../db');

const apiBaseUrl = 'http://www.thesneakerdatabase.com/api/getData?';

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/login', passport.authenticate('discord'));
router.get(
  '/auth',
  passport.authenticate('discord', {
    successRedirect: '/',
    failureRedirect: '/',
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) {
    db.query(
      `call add_user(?, ?, ?)`,
      [req.user.id, req.user.username, req.user.email],
      function (err, data) {
        if (err) {
          // error handling code goes here
          console.log('ERROR : ', err);
          res.sendStatus(err.status || 500);
        } else {
          // code to execute on data retrieval
          console.log('result from db is : ', data);
        }
      }
    );
  }

  res.render('index', {
    parseData: [],
  });
});

router.use(isLoggedIn);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/inventory', function (req, res, next) {
  db.query(`call get_inventory_info(?)`, req.user.id, function (err, data) {
    if (err) {
      // error handling code goes here
      console.log('ERROR : ', err);
      res.sendStatus(err.status || 500);
    } else {
      // code to execute on data retrieval
      console.log('result from db is : ', data);
      res.render('inventory', { parseData: data[0] });
    }
  });
});

router.post('/search', function (req, res, next) {
  const userSearchTerm = req.body.sneakerName.replace(' ', '+');
  const brand = req.body.brand;
  const gender = req.body.gender;
  const sneakerUrl = `${apiBaseUrl}gender=${gender}&brand=${brand}&title=${userSearchTerm}`;
  request.get(sneakerUrl, (error, response, sneakerData) => {
    try {
      let parseData = JSON.parse(sneakerData).data;
      parseData.forEach((shoe) => {
        db.query(
          `call add_product(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            shoe.id,
            shoe.brand || '',
            shoe.title || '',
            shoe.year || '',
            shoe.gender || '',
            shoe.colorway || '',
            shoe.styleId || '',
            shoe.media.thumbUrl || '',
            shoe.retailPrice || 0,
          ],
          function (err, data) {
            if (err) {
              console.log('ERROR : ', err);
            } else {
              // console.log('result from db is : ', data);
            }
          }
        );
      });
      res.render('index', { parseData });
    } catch (error) {
      res.sendStatus(500).send(error);
    }
  });
});

router.post('/addSneaker', function (req, res, next) {
  const pid = req.body.id;
  const quantity = req.body.quantity;
  const price = req.body.price;
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  db.query(
    `call add_inventory(?, ?, ?, ?, ?)`,
    [req.user.id, pid, quantity, price, today],
    function (err, data) {
      if (err) {
        // error handling code goes here
        console.log('ERROR : ', err);
        res.status(500);
      } else {
        // code to execute on data retrieval
        console.log('result from db is : ', data);
        // res.json(data);
      }
    }
  );
  res.render('index', {
    parseData: [],
  });
});

router.post('/sellSneaker', function (req, res, next) {
  const pid = req.body.id;
  console.log('pid ==========', req.body);
  const quantity = req.body.quantity;
  const price = req.body.price;
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  db.query(
    `call subtract_inventory(?, ?, ?, ?, ?)`,
    [req.user.id, pid, quantity, price, today],
    function (err, data) {
      if (err) {
        // error handling code goes here
        console.log('ERROR : ', err);
        res.status(500);
      } else {
        // code to execute on data retrieval
        console.log('result from db is : ', data);
        // res.json(data);
      }
    }
  );
  res.render('index', {
    parseData: [],
  });
});

router.get('/purchases', function (req, res, next) {
  let mode = 'Purchase';

  db.query(`call 	get_purchases(?)`, req.user.id, function (err, data) {
    if (err) {
      // error handling code goes here
      console.log('ERROR : ', err);
      res.sendStatus(err.status || 500);
    } else {
      // code to execute on data retrieval
      console.log('result from db is : ', data);
      res.render('transactions', { parseData: data[0], mode });
    }
  });
});

router.get('/sales', function (req, res, next) {
  let mode = 'Sold';

  db.query(`call get_sales(?)`, req.user.id, function (err, data) {
    if (err) {
      // error handling code goes here
      console.log('ERROR : ', err);
      res.sendStatus(err.status || 500);
    } else {
      // code to execute on data retrieval
      console.log('result from db is : ', data);
      res.render('transactions', { parseData: data[0], mode });
    }
  });
});

router.get('/analysis', function (req, res, next) {
  res.render('analysis');
});

router.get('/leaderboard', function (req, res, next) {
  const parseData = [
    {
      username: 'Kad',
      revenue: 10000,
      cost: 5,
      profit: 9995,
    },
    {
      username: 'Kad2',
      revenue: 999,
      cost: 1,
      profit: 998,
    },
  ];
  res.render('leaderboard', { parseData });
});

module.exports = router;
