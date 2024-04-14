import { CustomAuthVerifier } from "./CustomAuthVerifier";
import { ValidatorProps } from "./ValidatorProps";
export interface TotoControllerConfig {
    /**
     * Loads the configurations and returns a Promise when done
     */
    load(): Promise<any>;
    /**
     * Returns a CustomAuthVerifier, if any
     */
    getCustomAuthVerifier(): CustomAuthVerifier | undefined;
    /**
     * Returns the Validator Properties
     */
    getProps(): ValidatorProps;
    /**
     * Returns the expected audience.
     * The expected audience is used when verifying the Authorization's header Bearer JWT token.
     * The audience is extracted from the token and compared with the expected audience, to make sure
     * that the token was issued for the correct purpose (audience).
     *
     * @param authProvider A string with the code of the auth provider. Can be null, for which case this method is expected to return the expected audience for the default auth provider.
     */
    getExpectedAudience(authProvider?: string): string;
}
