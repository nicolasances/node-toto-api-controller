import { Logger } from "../logger/TotoLogger";
import { CustomAuthVerifier } from "../model/CustomAuthVerifier";
import { UserContext } from "../model/UserContext";
/**
 * This function allows extensions on the Toto authorization validator, by supporting custom authProvider and custom ways to verify authorization
 * @param {string} cid correlation id
 * @param {string} authorizationHeader Authorization HTTP header
 * @param {object} authorizationVerifier authorization verifier. It's an object that must have a function called verifyIdToken()
 * @param {object} logger the toto logger to use
 * @returns
 */
export declare function customAuthCheck(cid: string | string[] | undefined, authorizationHeader: string | string[] | undefined, authorizationVerifier: CustomAuthVerifier, logger: Logger): Promise<UserContext>;
