import { APIEndpoint } from "./TotoRegistryAPI";
import { Logger, TotoControllerConfig } from "../TotoAPIController";
/**
 * Configuration options for the RegistryCache
 */
export interface RegistryCacheOptions {
    /**
     * Time-to-live in minutes before the cache is invalidated and refreshed
     * @default 30
     */
    ttlMinutes?: number;
}
/**
 * The Registry cache caches all the API endpoints registered in the Toto Registry.
 * The cache is purely local and in-memory.
 * This is a singleton class - use RegistryCache.getInstance() to get the instance.
 */
export declare class RegistryCache {
    private static instance;
    private cache;
    private lastRefreshTime;
    private ttlMilliseconds;
    private registryAPI;
    logger: Logger | undefined;
    private constructor();
    /**
     * Gets the singleton instance of RegistryCache.
     *
     * @param config the TotoControllerConfig
     * @param options optional cache configuration
     * @returns the singleton instance
     */
    static getInstance(config?: TotoControllerConfig, options?: RegistryCacheOptions): RegistryCache;
    /**
     * Resets the singleton instance (useful for testing).
     */
    static resetInstance(): void;
    /**
     * Gets an API endpoint from the cache by apiName.
     * If the cache is stale or empty, it will be refreshed first.
     *
     * @param apiName the name of the API to retrieve
     * @returns the API endpoint or undefined if not found
     */
    getEndpoint(apiName: string): Promise<APIEndpoint | undefined>;
    /**
     * Gets all cached API endpoints.
     * If the cache is stale or empty, it will be refreshed first.
     *
     * @returns all cached API endpoints
     */
    getAllEndpoints(): Promise<APIEndpoint[]>;
    /**
     * Checks if the cache needs to be refreshed and refreshes it if necessary.
     * The cache is refreshed if:
     * - It's empty
     * - The TTL has expired
     */
    private refreshIfNeeded;
    /**
     * Forces a refresh of the cache by calling the TotoRegistryAPI.
     * This will fetch all API endpoints from the registry and update the cache.
     */
    refresh(): Promise<void>;
    /**
     * Manually invalidates the cache, forcing the next access to refresh from the registry.
     */
    invalidate(): void;
    /**
     * Clears the cache completely.
     */
    clear(): void;
    /**
     * Gets the number of cached API endpoints.
     *
     * @returns the number of cached entries
     */
    size(): number;
    /**
     * Checks if the cache is currently valid (not expired).
     *
     * @returns true if the cache is valid, false otherwise
     */
    isValid(): boolean;
}
