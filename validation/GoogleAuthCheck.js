const { OAuth2Client } = require('google-auth-library');

const decodeJWT = (token) => {
    if (token !== null || token !== undefined) {
        const base64String = token.split(`.`)[1];
        const decodedValue = JSON.parse(Buffer.from(base64String, `base64`).toString(`ascii`));
        return decodedValue;
    }
    return null;
}

/**
 * @param {string} cid the correlation ID
 * @param {HTTPHeaders} httpHeaders an object containing all the http headers. 
 * Will typically be an express request.headers. 
 * Note that HTTPHeaders should contain a header "x-client" that specifies the code of the client that wants to access the API. See authorizedClientId notes below. Here you would pass (referring to the example below), something like "clientABC"
 * If the "x-client" header is not provided, the "web" is assumed to be the default. 
 * @param {object} authorizedClientId a map of client ids as an object {"clientABC": clientID, "clientXYZ": clientID, etc..}. 
 * This field is a new addition that support a client ID for different applications, since an API could be authorized to be accessed by different applications. 
 * This was originated by the fact that GCP requires a different clientID for each device (web, ios, android, etc.. ), so extending on the logic, Google sees the clientID as an identifier that is provided to the application.
 * @param {logger} logger a Toto Logger instance
 * @returns 
 */
exports.googleAuthCheck = (cid, httpHeaders, authorizedClientIds, logger) => {

    return new Promise((success, failure) => {

        // Authorization
        let authorizationHeader = httpHeaders['authorization'];
        if (!authorizationHeader) authorizationHeader = httpHeaders['Authorization'];

        const clientIdentifier = httpHeaders['x-client']

        let authorizedClientId; 
        if (clientIdentifier) authorizedClientId = authorizedClientIds[clientIdentifier] ? authorizedClientIds[clientIdentifier] : authorizedClientIds; // Older versions only had one authorized client ID for each provider
        else authorizedClientId = authorizedClientIds['anyClient'] ? authorizedClientIds['anyClient'] : authorizedClientIds; // Older versions only had one authorized client ID for each provider

        let token = authorizationHeader.substring('Bearer'.length + 1);

        const client = new OAuth2Client(authorizedClientId);

        const decodedToken = decodeJWT(token)

        // Useful for debugging audience-related issues
        if (decodedToken.aud != authorizedClientId) {
            logger.compute(cid, `Payload Audience: ${decodedToken.aud}`, "info");
            logger.compute(cid, `Target Audience: ${authorizedClientId}`, "info");
        }

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