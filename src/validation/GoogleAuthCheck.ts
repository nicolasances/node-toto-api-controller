import { Logger } from "../logger/TotoLogger";
import { AUTH_PROVIDERS } from "../model/AuthProviders";

const { OAuth2Client } = require('google-auth-library');

const decodeJWT = (token: string | null) => {
    if (token !== null || token !== undefined) {
        const base64String = token!.split(`.`)[1];
        const decodedValue = JSON.parse(Buffer.from(base64String, `base64`).toString(`ascii`));
        return decodedValue;
    }
    return null;
}

export async function googleAuthCheck(cid: string, authorizationHeader: string | string[] | undefined, expectedAudience: string, logger: Logger, debugMode: boolean = false) {

    const token: string | null = authorizationHeader ? String(authorizationHeader).substring('Bearer'.length + 1) : null;

    const client = new OAuth2Client(expectedAudience);

    const decodedToken = decodeJWT(token)

    if (debugMode === true) logger.compute(cid, `[Google Auth Check Debug] - Decoded token: [${JSON.stringify(decodedToken)}]`)

    // Useful for debugging audience-related issues
    if (decodedToken.aud != expectedAudience) {
        logger.compute(cid, `Payload Audience: ${decodedToken.aud}`, "error");
        logger.compute(cid, `Expected Audience: ${expectedAudience}`, "error");
    }

    const ticket = await client.verifyIdToken({ idToken: token, audience: expectedAudience })

    let payload = ticket.getPayload();

    if (debugMode === true) logger.compute(cid, `[Google Auth Check Debug] - Token Verification Ticked payload: [${JSON.stringify(payload)}]`)

    return {
        userId: payload.sub,
        email: payload.email,
        authProvider: AUTH_PROVIDERS.google
    }

}