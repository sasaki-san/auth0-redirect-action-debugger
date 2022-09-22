# auth0-redirect-action-debugger

A web app that allows you to quickly test [Auth0 Redirect Actions](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions) without hosting an external page.



## Usage

Set a redirect url to `https://redirect-action-tester.yusasaki0.app` in your action.

### onExecutePostLogin

```javascript
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
```

### onContinuePostLogin

```javascript
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
```