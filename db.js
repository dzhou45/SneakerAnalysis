var mysql = require('mysql');

var PRODUCTION_DB = 'express',
  TEST_DB = 'express';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

var state = {
  pool: null,
  mode: null,
};

exports.connect = function(mode, done) {
  state.pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB,
  });

  state.mode = mode;
  done();
};

exports.get = function() {
  return state.pool;
};
