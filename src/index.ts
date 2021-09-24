import { AxiosInstance, AxiosResponse, AxiosPromise } from 'axios';
import { AxiosAuthRefreshOptions, AxiosAuthRefreshCache } from './model';
import {
    unsetCache,
    mergeOptions,
    defaultOptions,
    getRetryInstance,
    createRefreshCall,
    resendFailedRequest,
    shouldInterceptError,
    createRequestQueueInterceptor,
} from './utils';

export { AxiosAuthRefreshOptions, AxiosAuthRefreshRequestConfig } from './model';

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
export default function createAuthRefreshInterceptor(
    instance: AxiosInstance,
    refreshAuthCall: (error: any) => Promise<any>,
    options: AxiosAuthRefreshOptions = {},
): number {

    if (typeof refreshAuthCall !== 'function') {
        throw new Error('axios-auth-refresh requires `refreshAuthCall` to be a function that returns a promise.');
    }

    const cache: AxiosAuthRefreshCache = {
        skipInstances: [],
        refreshCall: undefined,
        requestQueueInterceptorId: undefined,
    };

    return instance.interceptors.response.use((response: AxiosResponse) => response, (error: any) => {

        options = mergeOptions(defaultOptions, options);

        if (!shouldInterceptError(error, options, instance, cache)) {
            return Promise.reject(error);
        }

        if (options.pauseInstanceWhileRefreshing) {
            cache.skipInstances.push(instance);
        }

        // If refresh call does not exist, create one
        const refreshing = createRefreshCall(error, refreshAuthCall, cache);

        // Create interceptor that will bind all the others requests until refreshAuthCall is resolved
        createRequestQueueInterceptor(instance, cache, options);

        return refreshing
            .finally(() => unsetCache(instance, cache))
            .catch(error => Promise.reject(error))
            .then(() => resendFailedRequest(error, getRetryInstance(instance, options)));
    });
}
