const { OAuth2Client } = require('google-auth-library');

class Validator {

  constructor(authorizedClientId) {
    this.authorizedClientId = authorizedClientId;
  }

  validate(req) {

    return new Promise((success, failure) => {

      let errors = [];
      let promises = [];

      let authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) authorizationHeader = req.headers['Authorization'];

      if (!authorizationHeader) errors.push('No Authorization provided!');

      if (authorizationHeader) {

        let token = authorizationHeader.substring('Bearer'.length + 1);

        const client = new OAuth2Client(this.authorizedClientId);

        let promise = client.verifyIdToken({ idToken: token, audience: this.authorizedClientId }).then(() => { }, (err) => {
          console.log("The validation of the token has failed!");
          console.log(err);
          errors.push("Invalid Authorization token");
        });

        promises.push(promise);
      }

      if (req.headers['x-correlation-id'] == null) errors.push('x-correlation-id is a mandatory header');

      Promise.all(promises).then(() => {

        if (errors.length > 0) success({ errors: errors });

        success({ errors: null });

      })

    });
  }
}

module.exports = Validator;