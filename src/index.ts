import {AxiosInstance} from "axios";
import {AxiosAuthRefreshOptions, AxiosAuthRefreshCache} from "./types";

/** @type {AxiosAuthRefreshOptions} */
const defaults: AxiosAuthRefreshOptions = {
    statusCodes: [ 401 ]
};

/** @type {AxiosAuthRefreshCache} */
const cache: AxiosAuthRefreshCache = {
    refreshCall: undefined,
    requestQueueInterceptorId: undefined
};

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
function createAuthRefreshInterceptor (
    axios: AxiosInstance,
    refreshTokenCall: (error: any) => Promise<any>,
    options: AxiosAuthRefreshOptions = {}
) {
    const id = axios.interceptors.response.use(res => res, error => {

        if (typeof refreshTokenCall !== 'function') {
            console.warn('axios-auth-refresh requires `refreshTokenCall` to be a function that returns a promise.');
            return Promise.reject(error);
        }

        // Rewrite default config
        options = mergeConfigs(options, defaults);

        // Reject promise if the error status is not in options.ports
        if (!shouldInterceptError(error, options)) {
            return Promise.reject(error);
        }

        // Remove the interceptor to prevent a loop in case token refresh also causes the 401
        axios.interceptors.response.eject(id);

        // If refresh call does not exist, create one
        const refreshing = createRefreshCall(error, refreshTokenCall, cache);

        // Create interceptor that will bind all the others requests until refreshTokenCall is resolved
        createRequestQueueInterceptor(axios, cache);

        // When response code is 401 (Unauthorized), try to refresh the token.
        return refreshing.then(() => {
            axios.interceptors.request.eject(cache.requestQueueInterceptorId);
            return axios(error.response.config);
        }).catch(error => {
            axios.interceptors.request.eject(cache.requestQueueInterceptorId);
            return Promise.reject(error);
        }).finally(() => {
            cache.refreshCall = undefined;
            cache.requestQueueInterceptorId = undefined;
            createAuthRefreshInterceptor(axios, refreshTokenCall, options)
        });
    });
    return axios;
}

/**
 * Merges two config objects (master rewrites slave)
 * @param {AxiosAuthRefreshOptions} master
 * @param {AxiosAuthRefreshOptions} slave
 * @return {AxiosAuthRefreshOptions}
 */
export function mergeConfigs (master: AxiosAuthRefreshOptions, slave: AxiosAuthRefreshOptions) {
    return { ...slave, ...master };
}

/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param {any} error
 * @param {AxiosAuthRefreshOptions} options
 * @return {boolean}
 */
export function shouldInterceptError (error: any, options: AxiosAuthRefreshOptions) {
    return error && error.response && options.statusCodes.includes(+error.response.status);
}

/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {any} error
 * @param {(error: any) => Promise<any>} fn
 * @param {AxiosAuthRefreshCache} cache
 * @return {Promise<any>}
 */
export function createRefreshCall (error: any, fn: (error: any) => Promise<any>, cache: AxiosAuthRefreshCache) {
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
export function createRequestQueueInterceptor (axios, cache: AxiosAuthRefreshCache) {
    if (typeof cache.requestQueueInterceptorId === 'undefined') {
        cache.requestQueueInterceptorId = axios.interceptors
            .request.use((request) => cache.refreshCall.then(() => request));
    }
    return cache.requestQueueInterceptorId;
}

export default createAuthRefreshInterceptor;
