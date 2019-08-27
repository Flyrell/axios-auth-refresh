import { AxiosInstance } from "axios";
import { AxiosAuthRefreshOptions, AxiosAuthRefreshCache } from "./types";
/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {AxiosInstance} axios - axios instance
 * @param {(error: any) => Promise<AxiosPromise>} refreshTokenCall - refresh token call which must return a Promise
 * @param {AxiosAuthRefreshOptions} options - options for the interceptor @see defaultOptions
 * @return {AxiosInstance}
 */
declare function createAuthRefreshInterceptor(axios: AxiosInstance, refreshTokenCall: (error: any) => Promise<any>, options?: AxiosAuthRefreshOptions): AxiosInstance;
/**
 * Merges two config objects (master rewrites slave)
 * @param {AxiosAuthRefreshOptions} master
 * @param {AxiosAuthRefreshOptions} def
 * @return {AxiosAuthRefreshOptions}
 */
export declare function mergeConfigs(master: AxiosAuthRefreshOptions, def: AxiosAuthRefreshOptions): AxiosAuthRefreshOptions;
/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param {any} error
 * @param {AxiosAuthRefreshOptions} options
 * @return {boolean}
 */
export declare function shouldInterceptError(error: any, options: AxiosAuthRefreshOptions): boolean;
/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {any} error
 * @param {(error: any) => Promise<any>} fn
 * @param {AxiosAuthRefreshCache} cache
 * @return {Promise<any>}
 */
export declare function createRefreshCall(error: any, fn: (error: any) => Promise<any>, cache: AxiosAuthRefreshCache): Promise<any>;
/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {AxiosInstance} axios
 * @param {AxiosAuthRefreshCache} cache
 * @return {number}
 */
export declare function createRequestQueueInterceptor(axios: AxiosInstance, cache: AxiosAuthRefreshCache): number;
export default createAuthRefreshInterceptor;
