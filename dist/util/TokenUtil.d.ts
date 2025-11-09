/**
 * Extracts the Bearer token from the HTTP Authorization header and decodes it
 * @param authorizationHeader HTTP Auth header
 * @returns a decoded JWT token as a json object
 */
export declare const decodeJWT: (authorizationHeader: string) => any;
export declare const extractTokenFromAuthHeader: (authorizationHeader: string) => string;
/**
 * Finds out what the Auth Provider of the JWT token is.
 * For tokens created by toto-auth, the auth provider is provided in the JWT token as a specific "authProvider" field.
 * For tokens created by other IDPs, look at the iss field of the JWT Token
 *
 * @param tokenJson the JWT token as a json object
 * @returns the auth provider based on the JWT token
 */
export declare const getAuthProvider: (tokenJson: any) => string;
