let request = require('request');
const logger = require('toto-logger');

exports.fbAuthCheck = (cid, authorizationHeader, authorizedClientId) => {

    return new Promise((success, failure) => {

        let token = authorizationHeader.substring('Bearer'.length + 1);

        request.get({ url: "https://graph.facebook.com/v10.0/me?fields=id,email&access_token=" + token }, (err, response, body) => {

            let result = JSON.parse(body);

            if (result.id) {
                success({
                    userId: result.id, 
                    email: result.email, 
                    authProvider: 'fb'
                });
            }
            else {
                logger.compute(cid, result.error.message, 'error')
                failure(result.error.message);
            }

        });

    });
}