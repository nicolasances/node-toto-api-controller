let { googleAuthCheck } = require('./GoogleAuthCheck');
let { fbAuthCheck } = require('./FBAuthCheck');

class Validator {

  constructor(props, authorizedClientId, authorizedFBClientId, logger) {
    this.props = props ? props : {};
    this.authorizedClientId = authorizedClientId;
    this.authorizedFBClientId = authorizedFBClientId;
    this.logger = logger;
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

        if (authorizationHeader) {

          // Google check
          // If no auth provider is passed, Google is assumed
          if (authProviderHeader == 'google' || !authProviderHeader) {

            let promise = googleAuthCheck(cid, authorizationHeader, this.authorizedClientId, this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

            promises.push(promise);

          }
          // Facebook check
          else if (authProviderHeader == 'fb') {

            let promise = fbAuthCheck(cid, authorizationHeader, this.authorizedFBClientId, this.logger).then((userContext) => { return { userContext: userContext } }, (err) => { errors.push(err); })

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

        if (errors.length > 0) {
        
          success({ errors: errors });

          errors.forEach((error) => {
            this.logger.compute(cid, "TotoAPIController - Validator - Error: " + error, 'error');
          })

        }
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