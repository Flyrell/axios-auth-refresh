import {AxiosAuthRefreshCache, AxiosAuthRefreshOptions} from "./types";
import {AxiosInstance} from "axios";


/**
 * Merges two config objects (master rewrites slave)
 * @param {AxiosAuthRefreshOptions} master
 * @param {AxiosAuthRefreshOptions} def
 * @return {AxiosAuthRefreshOptions}
 */
export function mergeConfigs(master: AxiosAuthRefreshOptions, def: AxiosAuthRefreshOptions): AxiosAuthRefreshOptions {
    return { ...def, ...master };
}

/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param {any} error
 * @param {AxiosAuthRefreshOptions} options
 * @return {boolean}
 */
export function shouldInterceptError(error: any, options: AxiosAuthRefreshOptions): boolean {
    return error && error.response && options.statusCodes.includes(+error.response.status);
}

/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {any} error
 * @param {(error: any) => Promise<any>} fn
 * @param {AxiosAuthRefreshCache} cache
 * @return {Promise<any>}
 */
export function createRefreshCall(
    error: any,
    fn: (error: any) => Promise<any>,
    cache: AxiosAuthRefreshCache
): Promise<any> {
    if (!cache.refreshCall) {
        cache.refreshCall = fn(error);
        if (typeof cache.refreshCall.then !== 'function') {
            console.warn('axios-auth-refresh requires `refreshTokenCall` to return a promise.');
            return Promise.reject();
        }
    }
    return cache.refreshCall;
}

/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {AxiosInstance} axios
 * @param {AxiosAuthRefreshCache} cache
 * @return {number}
 */
export function createRequestQueueInterceptor(axios: AxiosInstance, cache: AxiosAuthRefreshCache): number {
    if (typeof cache.requestQueueInterceptorId === 'undefined') {
        cache.requestQueueInterceptorId = axios
            .interceptors
            .request
            .use((request) => cache.refreshCall.then(() => request));
    }
    return cache.requestQueueInterceptorId;
}
