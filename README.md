# auth0-redirect-action-tester

A web app that allows you to quickly test [Auth0 Redirect Actions](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions) without hosting an external page.

## Usage

- Provide a `debug` object which contains `token_key` and `secret`. These values are used by the debugger to extract the necessary information from your token.
  - `token_key`: The `query` object's key which you specify your token when calling `api.redirect.sendUserTo`
  - `secret`: The secret you use to sign the token.
- In your action, redirect to `https://redirect-action-tester.yusasaki0.app`

## Sample Code

```javascript
exports.onExecutePostLogin = async (event, api) => {

  const token = api.redirect.encodeToken({
    expiresInSeconds: 60*60,
    secret: "my_secret_password",
    payload: {
      externalId: "abc-100"
    },
  });

  api.redirect.sendUserTo("https://redirect-action-tester.yusasaki0.app", {
    query: {
      session_token: token
    }
  });
};

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

## Sample

https://redirect-action-tester.yusasaki0.app/?session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Njg2NTIzOTAsImlzcyI6Inl1c2FzYWtpLmpwLmF1dGgwLmNvbSIsInN1YiI6ImF1dGgwfDYzNWEyNTlkM2VmOGJmYmY5YmExN2M0YiIsImV4cCI6MTk4NDAxMjM5MCwiaXAiOiIyNDBkOjFlOjhjOmI2MDA6YjlkZDplNjU0OjQwMGQ6ZWU1MyIsImV4dGVybmFsSWQiOiJhYmMtMTAwIn0.yCCJvVabMHzhIUUrKulI6Pvj9OjYOhwfnwCN4hFvVUE&state=hKFo2SBXVHpENFpidlZ0eXdXWmF6MXA0TmxDUXFBWVU4MDBHMKFuqHJlZGlyZWN0o3RpZNkgU3o5dmVLQWFFcjJrOUZmR0ZsMzB4bHVfRG10M3ZFZHajY2lk2SBpc1dybEV1UmU0VnUxcWh3OWc4bmtUT3BjZld6eGhMOA