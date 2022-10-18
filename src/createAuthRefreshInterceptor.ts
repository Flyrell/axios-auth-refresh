import type { AxiosInstance, AxiosResponse } from 'axios';
import type { AxiosAuthRefreshCache, AxiosAuthRefreshOptions } from './model';
import { mergeOptions } from './utils/mergeOptions';
import { defaultOptions } from './defaultOptions';
import { shouldInterceptError } from './utils/shouldInterceptError';
import { createRefreshCall } from './utils/createRefreshCall';
import { createRequestQueueInterceptor } from './utils/createRequestQueueInterceptor';
import { unsetCache } from './utils/unsetCache';
import { resendFailedRequest } from './utils/resendFailedRequest';
import { getRetryInstance } from './utils/getRetryInstance';

/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response status code is one of the options.statusCodes, interceptor calls the refreshAuthCall
 * which must return a Promise. While refreshAuthCall is running, all the new requests are intercepted and are waiting
 * for the refresh call to resolve. While running the refreshing call, instance provided is marked as a paused instance
 * which indicates the interceptor to not intercept any responses from it. This is because you'd otherwise need to mark
 * the specific requests you make by yourself in order to make sure it's not intercepted. This behavior can be
 * turned off, but use it with caution as you need to mark the requests with `skipAuthRefresh` flag yourself in order to
 * not run into interceptors loop.
 * @param instance Axios HTTP client instance
 * @param refreshAuthCall Refresh token call which must return a Promise
 * @param options Options for the interceptor see defaultOptions
 * @return Interceptor id (in case you want to eject it manually)
 */
export const createAuthRefreshInterceptor = (
    instance: AxiosInstance,
    refreshAuthCall: (error: unknown) => Promise<any>,
    options: AxiosAuthRefreshOptions = {}
): number => {
    if (typeof refreshAuthCall !== 'function') {
        throw new Error('axios-auth-refresh requires `refreshAuthCall` to be a function that returns a promise.');
    }

    const cache: AxiosAuthRefreshCache = {
        skipInstances: [],
        refreshCall: undefined,
        requestQueueInterceptorId: undefined,
    };

    return instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: unknown) => {
            const mergedOptions = mergeOptions(defaultOptions, options);

            if (!shouldInterceptError(error, mergedOptions, instance, cache)) {
                return Promise.reject(error);
            }

            if (mergedOptions.pauseInstanceWhileRefreshing) {
                cache.skipInstances.push(instance);
            }

            // If refresh call does not exist, create one
            const refreshing = createRefreshCall(error, refreshAuthCall, cache);

            // Create interceptor that will bind all the others requests until refreshAuthCall is resolved
            createRequestQueueInterceptor(instance, cache, mergedOptions);

            return refreshing
                .finally(() => unsetCache(instance, cache))
                .catch(async (reason) => Promise.reject(reason))
                .then(async () => resendFailedRequest(error, getRetryInstance(instance, mergedOptions)));
        }
    );
};
