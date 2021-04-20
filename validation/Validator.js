let { googleAuthCheck } = require('./GoogleAuthCheck');
let { fbAuthCheck } = require('./FBAuthCheck');

class Validator {

  constructor(authorizedClientId, authorizedFBClientId) {
    this.authorizedClientId = authorizedClientId;
    this.authorizedFBClientId = authorizedFBClientId;
  }

  validate(req) {

    return new Promise((success, failure) => {

      let errors = [];
      let promises = [];

      // Extraction of the headers
      // Authorization
      let authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) authorizationHeader = req.headers['Authorization'];

      // Auth Provider
      let authProviderHeader = req.headers['auth-provider'];

      // Correlation ID 
      let cid = req.headers['x-correlation-id']

      if (!authorizationHeader) errors.push('No Authorization provided!');

      if (authorizationHeader) {

        // Google check
        if (authProviderHeader == 'google') {

          let promise = googleAuthCheck(cid, authorizationHeader, this.authorizedClientId).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

          promises.push(promise);

        }

        // Facebook check
        if (authProviderHeader == 'fb') {

          let promise = fbAuthCheck(cid, authorizationHeader, this.authorizedFBClientId).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

          promises.push(promise);
        }
      }

      if (cid == null) errors.push('No Correlation ID provided');

      Promise.all(promises).then((values) => {

        if (errors.length > 0) success({ errors: errors });
        else {
          if (values && values.length > 0) {
            for (let i = 0; i < values.length; i++) {
              if (values[i] && values[i].userContext) success({ errors: null, userContext: values[i].userContext });
            }
          }
          else success({ errors: null });
        }

      })

    });
  }
}

module.exports = Validator;