# Auth0 Redirect Action Tester

This is a web application that allows you to quickly test and demonstrate [Auth0 Redirect Actions](https://auth0.com/docs/customize/actions/flows-and-triggers/login-flow/redirect-with-actions) without the need to build an external application.

With this app, you can:

- Test and demonstrate the entire flow of Redirect Actions from start to finish without building an external application yourself.
- Test and demonstrate the data transmission between Auth0 Actions and an external application, allowing you to inspect received data and modify the data to send back to Auth0 Action.
- Validate the signature of the received token.
- Provide a signature (HS256) to the data which you send back to Auth0 Actions.

## Usage

Implemenet a Redirect Action in Auth0 (see the sample below) and spectify the redirect URL to this application, which you can either host by yourself or use the hosted one `https://redirect-action-tester.yusasaki0.app`

### Redirect Action Sample Code

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

### Sample Redirect 

https://redirect-action-tester.yusasaki0.app/?session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Njg2NTIzOTAsImlzcyI6Inl1c2FzYWtpLmpwLmF1dGgwLmNvbSIsInN1YiI6ImF1dGgwfDYzNWEyNTlkM2VmOGJmYmY5YmExN2M0YiIsImV4cCI6MTk4NDAxMjM5MCwiaXAiOiIyNDBkOjFlOjhjOmI2MDA6YjlkZDplNjU0OjQwMGQ6ZWU1MyIsImV4dGVybmFsSWQiOiJhYmMtMTAwIn0.yCCJvVabMHzhIUUrKulI6Pvj9OjYOhwfnwCN4hFvVUE&state=hKFo2SBXVHpENFpidlZ0eXdXWmF6MXA0TmxDUXFBWVU4MDBHMKFuqHJlZGlyZWN0o3RpZNkgU3o5dmVLQWFFcjJrOUZmR0ZsMzB4bHVfRG10M3ZFZHajY2lk2SBpc1dybEV1UmU0VnUxcWh3OWc4bmtUT3BjZld6eGhMOA