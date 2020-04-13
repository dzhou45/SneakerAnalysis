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
    failureRedirect: '/loginFailed',
  })
);

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
  // console.log(req.user);
  const baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers';
  const userId = req.user.username.id;
  const parseData = [
    {
      id: '104e1c79-26a5-463d-86c4-88ca95ad2d3e',
      brand: 'Jordan',
      colorway: 'University Blue/Black-Varsity Red',
      gender: 'men',
      media: {
        imageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        smallImageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=300&h=214&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        thumbUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
      },
      releaseDate: '2018-06-09 23:59:59',
      retailPrice: 225,
      styleId: '308497-406',
      title: 'Jordan 4 Retro Travis Scott Cactus Jack',
      year: 2018,
      quantity: 4,
    },
  ];
  res.render('inventory', { parseData });
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
          `call add_product(?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            shoe.id,
            shoe.brand || '',
            shoe.title || '',
            shoe.year || '',
            shoe.gender || '',
            shoe.colorway || '',
            shoe.imageUrl || '',
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
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  console.log(today);
  db.query(
    `call add_inventory(?, ?, ?)`,
    [req.user.id, pid, quantity],
    function (err, data) {
      if (err) {
        // error handling code goes here
        console.log('ERROR : ', err);
      } else {
        // code to execute on data retrieval
        console.log('result from db is : ', data);
      }
    }
  );
  res.render('index', {
    parseData: [],
  });
});

router.get('/purchases', function (req, res, next) {
  let mode = 'Purchase';
  let parseData = [
    {
      id: '104e1c79-26a5-463d-86c4-88ca95ad2d3e',
      brand: 'Jordan',
      colorway: 'University Blue/Black-Varsity Red',
      gender: 'men',
      media: {
        imageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        smallImageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=300&h=214&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        thumbUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
      },
      releaseDate: '2018-06-09 23:59:59',
      retailPrice: 225,
      styleId: '308497-406',
      title: 'Jordan 4 Retro Travis Scott Cactus Jack',
      actionDate: '4/10/2020',
      actionPrice: 399,
    },
  ];

  res.render('transactions', { parseData, mode });
});

router.get('/sales', function (req, res, next) {
  let mode = 'Sold';
  let parseData = [
    {
      id: '104e1c79-26a5-463d-86c4-88ca95ad2d3e',
      brand: 'Jordan',
      colorway: 'University Blue/Black-Varsity Red',
      gender: 'men',
      media: {
        imageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        smallImageUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=300&h=214&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
        thumbUrl:
          'https://stockx.imgix.net/Air-Jordan-4-Retro-Travis-Scott-Cactus-Jack-Reg-Backshot.jpeg?fit=fill&bg=FFFFFF&w=140&h=100&auto=format,compress&trim=color&q=90&dpr=2&updated_at=1538080256',
      },
      releaseDate: '2018-06-09 23:59:59',
      retailPrice: 225,
      styleId: '308497-406',
      title: 'Jordan 4 Retro Travis Scott Cactus Jack',
      actionDate: '4/10/2020',
      actionPrice: 399,
    },
  ];

  res.render('transactions', { parseData, mode });
});

router.get('/analysis', function (req, res, next) {
  res.render('analysis');
});

module.exports = router;
