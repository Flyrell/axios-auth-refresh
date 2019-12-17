import { AxiosInstance, AxiosRequestConfig } from 'axios';
export interface AxiosAuthRefreshOptions {
    instance?: AxiosInstance;
    statusCodes?: Array<number>;
    skipWhileRefreshing?: boolean;
}
export interface AxiosAuthRefreshCache {
    skipInstances: AxiosInstance[];
    refreshCall: Promise<any> | undefined;
    requestQueueInterceptorId: number | undefined;
}
export interface AxiosAuthRefreshRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}
/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response status code is one of the options.statusCodes, interceptor calls the refreshAuthCall
 * which must return a Promise. While refreshAuthCall is running, all the new requests are intercepted and are waiting
 * for the refresh call to resolve. While running the refreshing call, instance provided is marked as a paused instance
 * which indicates the interceptor to not intercept any responses from it. This is because you'd otherwise need to mark
 * the specific requests you make by yourself in order to make sure it's not intercepted. This behavior can be
 * turned off, but use it with caution as you need to mark the requests with `skipAuthRefresh` flag yourself in order to
 * not run into interceptors loop.
 *
 * @param {AxiosInstance} instance - Axios HTTP client instance
 * @param {(error: any) => Promise<AxiosPromise>} refreshAuthCall - refresh token call which must return a Promise
 * @param {AxiosAuthRefreshOptions} options - options for the interceptor @see defaultOptions
 * @return {number} - interceptor id (in case you want to eject it manually)
 */
export default function createAuthRefreshInterceptor(instance: AxiosInstance, refreshAuthCall: (error: any) => Promise<any>, options?: AxiosAuthRefreshOptions): number;
/**
 * Merges two options objects (master rewrites slave).
 *
 * @return {AxiosAuthRefreshOptions}
 */
export declare function mergeOptions(slave: AxiosAuthRefreshOptions, master: AxiosAuthRefreshOptions): AxiosAuthRefreshOptions;
/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 *
 * @return {boolean}
 */
export declare function shouldInterceptError(error: any, options: AxiosAuthRefreshOptions, instance: AxiosInstance, cache: AxiosAuthRefreshCache): boolean;
/**
 * Creates refresh call if it does not exist or returns the existing one.
 *
 * @return {Promise<any>}
 */
export declare function createRefreshCall(error: any, fn: (error: any) => Promise<any>, cache: AxiosAuthRefreshCache): Promise<any>;
/**
 * Creates request queue interceptor if it does not exist and returns its id.
 *
 * @return {number}
 */
export declare function createRequestQueueInterceptor(instance: AxiosInstance, cache: AxiosAuthRefreshCache): number;
/**
 * Ejects request queue interceptor and unset interceptor cached values.
 *
 * @param {AxiosInstance} instance
 * @param {AxiosAuthRefreshCache} cache
 */
export declare function unsetCache(instance: AxiosInstance, cache: AxiosAuthRefreshCache): void;
