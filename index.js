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

const onExecutePostLoginCode = `
exports.onExecutePostLogin = async (event, api) => {

  const token = api.redirect.encodeToken({
    expiresInSeconds: 60,
    secret: "my_secret_password",
    payload: {
      externalId: "abc-100"
    },
  });

  const debug = encodeURIComponent(JSON.stringify({
    token_key: "session_token",
    secret: "my_secret_password"
  }));

  api.redirect.sendUserTo("https://redirect-action-tester.yusasaki0.app", {
    query: {
      session_token: token,
      debug
    }
  });
};

`;

const onContinuePostLoginCode = `
exports.onContinuePostLogin = async (event, api) => {

  const token = api.redirect.validateToken({
    secret: "my_secret_password",
    tokenParameterName: 'session_token'
  });

  if (event.user.user_id !== token.sub) {
    api.access.deny("The user who initiated the login process does not match with the one who resumed it.");
    return;
  }

  const isKycAgreed = token.isKycAgreed;
  if (!isKycAgreed) {
    api.access.deny("You must agree with the KYC.");
    return;
  }

  api.user.setAppMetadata("key_agreed", isKycAgreed)
};
`


const generateContinueUrl = (state, data, secret, domain, token_key) => {
  state = decodeURIComponent(state)
  secret = decodeURIComponent(secret)
  data = JSON.parse(decodeURIComponent(data)) 
  token_key = decodeURIComponent(token_key)
  const signedToken = jwt.sign(
    {
      state,
      ...data
    },
    secret,
    { algorithm: "HS256" }
  );
  const url = `https://${domain}/continue?state=${state}&${token_key}=${signedToken}`
  return url
}

app.get('/', function (req, res) {
  let error, token, state = req.query.state, domain, debug, data, newData = {}, secret = "My secret password", token_key, continue_url;
  try {
    debug = verifyDebugParam(req.query.debug);
    if (debug.token_key) {
      token = req.query[debug.token_key]
    }
    secret = debug.secret || secret
    data = jwt.decode(token)
    token_key = debug.token_key
    domain = data.iss;
    continue_url = generateContinueUrl(state, JSON.stringify(newData), secret, domain, token_key)
  } catch (e) {
    error = e
  }

  res.render('redirected', {
    error,
    token,
    state,
    secret,
    domain,
    token_key,
    debug: JSON.stringify(debug, null, 4),
    data: JSON.stringify(data, null, 4),
    newData: JSON.stringify(newData, null, 4),
    continue_url,
    onExecutePostLoginCode,
    onContinuePostLoginCode
  });

});

app.get("/continue-url", function (req, res) {
  const { state, domain, newData, secret, token_key } = req.query;
  console.log(req.query)
  const url = generateContinueUrl(state, newData, secret, domain, token_key)
  res.json({
    url
  })
});

app.post('/submit', function (req, res) {
  let { state, domain, newData, secret, token_key } = req.body;
  const url = generateContinueUrl(state, newData, secret, domain, token_key)
  res.redirect(url)
});

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}
