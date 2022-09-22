# auth0-redirect-action-debugger

A web app that allows you to quickly test [Auth0 Redirect Actions](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions) without hosting an external page.

## Usage

- Provide a `debug` object which contains `token_key` and `secret`. These values are used by the debugger to extract the necessary information from your token.
  - `token_key`: The `query` object's key which you specify your token when calling `api.redirect.sendUserTo`
  - `secret`: The secret you use to sign the token.
- In your action, redirect to `https://redirect-action-tester.yusasaki0.app`

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

  api.redirect.sendUserTo("https://redirect-action-tester.yusasaki0.app", {
    query: {
      session_token: token
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

## Sample

https://redirect-action-tester.yusasaki0.app/?session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjM4MTc1MzUsImlzcyI6Inl1c2FzYWtpLmpwLmF1dGgwLmNvbSIsInN1YiI6ImF1dGgwfDYzMTAzOGVjNDkzNzJiZTczMmI3ODEzMCIsImV4cCI6MTY2MzgxNzU5NSwiaXAiOiIyNDBkOjFlOjhjOmI2MDA6OTUwNTpmMTg5OjE4NzA6NDUzOCIsInVzZXJfbmFtZSI6Inl1c2FzYWtpIn0.WyaVa3VnmS9hFWfte7Mh8PWTa4Xd1HOIL2dBIz1BOoc&debug=%257B%2522token_key%2522%253A%2522session_token%2522%252C%2522secret%2522%253A%2522my_secret_password%2522%257D&state=hKFo2SAxM0k5ejNtMUVNbThwNUFiUGtRdVFnRmxZcnQ4bFAtcKFuqHJlZGlyZWN0o3RpZNkgWUlOQlR3QWZtRmtvMVJOeHkyZXB0S0JPOXN1UXhQUmSjY2lk2SBpc1dybEV1UmU0VnUxcWh3OWc4bmtUT3BjZld6eGhMOA#