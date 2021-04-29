let { googleAuthCheck } = require('./GoogleAuthCheck');
let { fbAuthCheck } = require('./FBAuthCheck');

class Validator {

  constructor(props, authorizedClientId, authorizedFBClientId) {
    this.props = props ? props : {};
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

      // Checking authorization
      // If the config doesn't say to bypass authorization, look for the Auth header
      if (this.props.noAuth == null || this.props.noAuth == false) {

        if (!authorizationHeader) errors.push('No Authorization provided!');
        if (!authProviderHeader) errors.push('No Authorization Provider defined!');

        if (authorizationHeader) {

          // Google check
          if (authProviderHeader == 'google') {

            let promise = googleAuthCheck(cid, authorizationHeader, this.authorizedClientId).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);

          }
          // Facebook check
          else if (authProviderHeader == 'fb') {

            let promise = fbAuthCheck(cid, authorizationHeader, this.authorizedFBClientId).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);
          }
          else errors.push("The provided Authorization Provider (" + authProviderHeader + ") is not supported! ");
        }
      }

      // Checking Correlation ID
      if (this.props.noCorrelationId == null || this.props.noCorrelationId == false) {

        if (cid == null) errors.push('No Correlation ID provided');

      }

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