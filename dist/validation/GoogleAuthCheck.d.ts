import { Logger } from "../logger/TotoLogger";
export declare function googleAuthCheck(cid: string, authorizationHeader: string | string[] | undefined, expectedAudience: string, logger: Logger): Promise<{
    userId: any;
    email: any;
    authProvider: string;
}>;
