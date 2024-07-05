export interface TotoPathOptions {
    /**
     * Allows to override the auth configuration on a path level
     */
    noAuth: boolean;
    /**
     * Only for stream GET paths, allows to set the content type of the response
     */
    contentType: string;
}
