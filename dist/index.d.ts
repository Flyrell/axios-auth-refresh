import { AxiosInstance } from "axios";
export interface AxiosAuthRefreshOptions {
    statusCodes?: Array<number>;
}
export interface AxiosAuthRefreshCache {
    refreshCall: Promise<any> | undefined;
    requestQueueInterceptorId: number | undefined;
}
/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {AxiosInstance} axios - axios instance
 * @param {(error: any) => Promise<AxiosPromise>} refreshTokenCall - refresh token call which must return a Promise
 * @param {AxiosAuthRefreshOptions} options - options for the interceptor @see defaultOptions
 * @return {number} - interceptor id (in case you want to eject it manually)
 */
export default function createAuthRefreshInterceptor(axios: AxiosInstance, refreshTokenCall: (error: any) => Promise<any>, options?: AxiosAuthRefreshOptions): number;
/**
 * Merges two config objects (master rewrites slave)
 */
export declare function mergeConfigs(master: AxiosAuthRefreshOptions, def: AxiosAuthRefreshOptions): AxiosAuthRefreshOptions;
/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 */
export declare function shouldInterceptError(error: any, options: AxiosAuthRefreshOptions): boolean;
/**
 * Creates refresh call if it does not exist or returns the existing one
 */
export declare function createRefreshCall(error: any, fn: (error: any) => Promise<any>, cache: AxiosAuthRefreshCache): Promise<any>;
/**
 * Creates refresh call if it does not exist or returns the existing one
 */
export declare function createRequestQueueInterceptor(axios: AxiosInstance, cache: AxiosAuthRefreshCache): number;
