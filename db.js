var mysql = require('mysql');

var PRODUCTION_DB = 'shoes',
  TEST_DB = 'shoes';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

var state = {
  pool: null,
  mode: null,
};

exports.connect = function (mode, done) {
  state.pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB,
  });

  state.mode = mode;
  done();
};

exports.query = function (query, values, done) {
  state.pool.query(query, values, function (err, result) {
    if (err) return done(err);
    done(null, result);
  });
};

exports.get = function () {
  return state.pool;
};
