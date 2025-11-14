"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryCache = void 0;
const TotoRegistryAPI_1 = require("./TotoRegistryAPI");
const TotoAPIController_1 = require("../TotoAPIController");
const DEFAULT_TTL_MINUTES = 30;
/**
 * The Registry cache caches all the API endpoints registered in the Toto Registry.
 * The cache is purely local and in-memory.
 * This is a singleton class - use RegistryCache.getInstance() to get the instance.
 */
class RegistryCache {
    constructor(config, options) {
        var _a;
        this.cache = new Map();
        this.lastRefreshTime = 0;
        this.registryAPI = new TotoRegistryAPI_1.TotoRegistryAPI(config);
        this.ttlMilliseconds = ((_a = options === null || options === void 0 ? void 0 : options.ttlMinutes) !== null && _a !== void 0 ? _a : DEFAULT_TTL_MINUTES) * 60 * 1000;
        this.logger = config.logger;
    }
    /**
     * Gets the singleton instance of RegistryCache.
     *
     * @param config the TotoControllerConfig
     * @param options optional cache configuration
     * @returns the singleton instance
     */
    static getInstance(config, options) {
        if (!RegistryCache.instance) {
            if (!config)
                throw new TotoAPIController_1.TotoRuntimeError(500, "RegistryCache not initialized. Config is required on first call to getInstance(). This is a configuration error in your application.");
            RegistryCache.instance = new RegistryCache(config, options);
        }
        return RegistryCache.instance;
    }
    /**
     * Resets the singleton instance (useful for testing).
     */
    static resetInstance() {
        RegistryCache.instance = null;
    }
    /**
     * Gets an API endpoint from the cache by apiName.
     * If the cache is stale or empty, it will be refreshed first.
     *
     * @param apiName the name of the API to retrieve
     * @returns the API endpoint or undefined if not found
     */
    getEndpoint(apiName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refreshIfNeeded();
            return this.cache.get(apiName);
        });
    }
    /**
     * Gets all cached API endpoints.
     * If the cache is stale or empty, it will be refreshed first.
     *
     * @returns all cached API endpoints
     */
    getAllEndpoints() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.refreshIfNeeded();
            return Array.from(this.cache.values());
        });
    }
    /**
     * Checks if the cache needs to be refreshed and refreshes it if necessary.
     * The cache is refreshed if:
     * - It's empty
     * - The TTL has expired
     */
    refreshIfNeeded() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const isExpired = (now - this.lastRefreshTime) > this.ttlMilliseconds;
            const isEmpty = this.cache.size === 0;
            if (isEmpty || isExpired) {
                yield this.refresh();
            }
        });
    }
    /**
     * Forces a refresh of the cache by calling the TotoRegistryAPI.
     * This will fetch all API endpoints from the registry and update the cache.
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield this.registryAPI.getAPIs();
                // Clear the existing cache
                this.cache.clear();
                // Populate the cache with fresh data
                response.apis.forEach(api => {
                    this.cache.set(api.apiName, api);
                });
                // Update the last refresh time
                this.lastRefreshTime = Date.now();
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.compute("REFRESH", `Registry cache refreshed with ${this.cache.size} API endpoints`);
            }
            catch (error) {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.compute("REFRESH", `Failed to refresh registry cache: ${error}`);
                throw error;
            }
        });
    }
    /**
     * Manually invalidates the cache, forcing the next access to refresh from the registry.
     */
    invalidate() {
        var _a;
        this.lastRefreshTime = 0;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.compute("", 'Registry cache invalidated');
    }
    /**
     * Clears the cache completely.
     */
    clear() {
        var _a;
        this.cache.clear();
        this.lastRefreshTime = 0;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.compute("", 'Registry cache cleared');
    }
    /**
     * Gets the number of cached API endpoints.
     *
     * @returns the number of cached entries
     */
    size() {
        return this.cache.size;
    }
    /**
     * Checks if the cache is currently valid (not expired).
     *
     * @returns true if the cache is valid, false otherwise
     */
    isValid() {
        const now = Date.now();
        return this.cache.size > 0 && (now - this.lastRefreshTime) <= this.ttlMilliseconds;
    }
}
exports.RegistryCache = RegistryCache;
RegistryCache.instance = null;
