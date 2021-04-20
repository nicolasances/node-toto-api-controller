const { OAuth2Client } = require('google-auth-library');
const logger = require('toto-logger');

exports.googleAuthCheck = (cid, authorizationHeader, authorizedClientId) => {

    return new Promise((success, failure) => {

        let token = authorizationHeader.substring('Bearer'.length + 1);

        const client = new OAuth2Client(authorizedClientId);

        client.verifyIdToken({ idToken: token, audience: authorizedClientId }).then((ticket) => {

            let payload = ticket.getPayload();

            success({
                userId: payload.sub, 
                email: payload.email, 
                authProvider: 'google'
            })

        }, (err) => {
            logger.compute(cid, err, 'error')
            failure("Invalid Authorization token");
        });
    });
}