'use strict'

/**
 * Module dependencies.
 */

var express = require('express');
const jwt = require("jsonwebtoken");
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


const verifyDebugParam = (debugRaw) => {

  const debug = JSON.parse(decodeURIComponent(debugRaw));

  if (!debug) {
    throw Error("debug parameter is not passed");
  }

  if (!debug.token_key) {
    throw Error("debug.token_key parameter does not exist");
  }

  return debug
}

const generateContinueUrl = (iss, sub, exp, state, newData, secret, domain, token_key) => {
  sub = decodeURIComponent(sub)
  exp = parseInt(decodeURIComponent(exp))
  state = decodeURIComponent(state)
  state = decodeURIComponent(state)
  secret = decodeURIComponent(secret)
  newData = JSON.parse(decodeURIComponent(newData))
  token_key = decodeURIComponent(token_key)

  // set expiration to 60 seconds
  exp = Math.floor(Date.now()/1000) + 60

  const signedToken = jwt.sign(
    {
      sub,
      exp,
      state,
      ...newData
    },
    secret,
    { algorithm: "HS256" }
  );
  const url = `https://${domain}/continue?state=${state}&${token_key}=${signedToken}`
  return url
}

app.get('/', function (req, res) {
  let error, token, iss, sub, exp, state = req.query.state, domain, debug, data, newData = {}, secret = "My secret password", token_key, continue_url;
  try {
    debug = verifyDebugParam(req.query.debug);
    if (debug.token_key) {
      token = req.query[debug.token_key]
    }
    secret = debug.secret || secret
    data = jwt.decode(token)
    token_key = debug.token_key
    domain = data.iss;
    iss = data.iss;
    sub =encodeURIComponent(data.sub);
    exp = data.exp;
    continue_url = generateContinueUrl(data.iss, data.sub, data.exp, state, JSON.stringify(newData), secret, domain, token_key)
  } catch (e) {
    error = e
  }

  try {
  } catch (e) {
    error = e
  }

  res.render('redirected', {
    error,
    token,
    iss,
    sub,
    exp,
    state,
    secret,
    domain,
    token_key,
    debug: JSON.stringify(debug, null, 4),
    data: JSON.stringify(data, null, 4),
    newData: JSON.stringify(newData, null, 4),
    continue_url,
  });

});

app.get("/continue-url", function (req, res) {
  const { iss, sub, exp, state, domain, newData, secret, token_key } = req.query;
  const url = generateContinueUrl(iss, sub, exp, state, newData, secret, domain, token_key)
  res.json({
    url
  })
});

app.post('/submit', function (req, res) {
  let { continue_url } = req.body;
  res.redirect(continue_url)
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
