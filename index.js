'use strict'

/**
 * Module dependencies.
 */

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');

var app = module.exports = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Register ejs as .html. If we did
// not call this, we would need to
// name our views foo.ejs instead
// of foo.html. The __express method
// is simply a function that engines
// use to hook into the Express view
// system by default, so if we want
// to change "foo.ejs" to "foo.html"
// we simply pass _any_ function, in this
// case `ejs.__express`.

app.engine('.html', require('ejs').__express);

// Optional since express defaults to CWD/views

app.set('views', path.join(__dirname, 'views'));

// Path to our public directory

app.use(express.static(path.join(__dirname, 'public')));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set('view engine', 'html');

app.get('/:token_query_key', function (req, res) {
  const state = req.query.state;
  const token = req.query[req.params.token_query_key];
  const origin = req.get('origin')
  res.render('redirected', {
    token,
    state,
    origin,
    title: "Auth0 Redirect Action Tester"
  });
});

app.post('/submit', function (req, res) {

  const state = req.query.state;
  const domain = req.body.domain;
  const token_key = req.body.token_key;
  const data = req.body.data;
  const token = data;

  const url = `https://${domain}/continue?state=${state}&${token_key}=${token}`

  res.redirect(url)
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
