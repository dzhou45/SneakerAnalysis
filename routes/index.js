var express = require('express');
var path = require('path');
var request = require('request');
var router = express.Router();
const passport = require('passport');

const apiKey = '1fb720b97cc13e580c2c35e1138f90f8';
const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`;
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

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

router.use((req, res, next) => {
  res.locals.imageBaseUrl = imageBaseUrl;
  next();
});

router.get('/', function(req, res, next) {
  request.get(nowPlayingUrl, (error, response, movieData) => {
    const parseData = JSON.parse(movieData);
    res.render('index', {
      parseData: parseData.results,
    });
  });
});

router.use(isLoggedIn);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/movie/:id', function(req, res, next) {
  const movieId = req.params.id;
  const thisMovieUrl = `${apiBaseUrl}/movie/${movieId}?api_key=${apiKey}`;

  request.get(thisMovieUrl, (error, response, movieData) => {
    const parseData = JSON.parse(movieData);
    res.render('single-movie', {
      parseData,
    });
  });
});

router.get('/favorites', function(req, res, next) {
  console.log(req.user.username);
  res.json({ username: req.user.username });
});

router.post('/search', function(req, res, next) {
  const userSearchTerm = encodeURI(req.body.movieSearch);
  const cat = req.body.cat;
  const movieUrl = `${apiBaseUrl}/search/${cat}/?query=${userSearchTerm}&api_key=${apiKey}`;

  request.get(movieUrl, (error, response, movieData) => {
    let parseData = JSON.parse(movieData);

    if (cat === 'person') {
      parseData.results = parseData.results[0].known_for;
    }

    res.render('index', { parseData: parseData.results });
  });
});

module.exports = router;
