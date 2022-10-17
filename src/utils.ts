import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { AxiosAuthRefreshOptions, AxiosAuthRefreshCache } from './model';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}

export const defaultOptions: AxiosAuthRefreshOptions = {
    statusCodes: [401],
    pauseInstanceWhileRefreshing: false,
};

/**
 * Merges two options objects (options overwrites defaults).
 *
 * @return {AxiosAuthRefreshOptions}
 */
export const mergeOptions = (
    defaults: AxiosAuthRefreshOptions,
    options: AxiosAuthRefreshOptions
): AxiosAuthRefreshOptions => ({ ...defaults, pauseInstanceWhileRefreshing: options.skipWhileRefreshing, ...options });

/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 *
 * @return {boolean}
 */
export const shouldInterceptError = (
    error: any,
    options: AxiosAuthRefreshOptions,
    instance: AxiosInstance,
    cache: AxiosAuthRefreshCache
): boolean => {
    if (!error) {
        return false;
    }

    if (error.config?.skipAuthRefresh) {
        return false;
    }

    if (
        !(options.interceptNetworkError && !error.response && error.request.status === 0) &&
        (!error.response ||
            (options.shouldRefresh
                ? !options.shouldRefresh(error)
                : !options.statusCodes?.includes(parseInt(error.response.status, 10))))
    ) {
        return false;
    }

    // Copy config to response if there's a network error, so config can be modified and used in the retry
    if (!error.response) {
        error.response = {
            config: error.config,
        };
    }

    return !options.pauseInstanceWhileRefreshing || !cache.skipInstances.includes(instance);
};

/**
 * Creates refresh call if it does not exist or returns the existing one.
 *
 * @return {Promise<any>}
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const createRefreshCall = (
    error: any,
    fn: (error: any) => Promise<any>,
    cache: AxiosAuthRefreshCache
): Promise<any> => {
    if (!cache.refreshCall) {
        cache.refreshCall = fn(error);
        if (typeof cache.refreshCall.then !== 'function') {
            console.warn('axios-auth-refresh requires `refreshTokenCall` to return a promise.');
            return Promise.reject();
        }
    }
    return cache.refreshCall;
};

/**
 * Creates request queue interceptor if it does not exist and returns its id.
 *
 * @return {number}
 */
export const createRequestQueueInterceptor = (
    instance: AxiosInstance,
    cache: AxiosAuthRefreshCache,
    options: AxiosAuthRefreshOptions
): number => {
    if (typeof cache.requestQueueInterceptorId === 'undefined') {
        cache.requestQueueInterceptorId = instance.interceptors.request.use((request: CustomAxiosRequestConfig) => {
            if (request.skipAuthRefresh) return request;
            return cache.refreshCall
                ? cache.refreshCall
                      .catch(() => {
                          throw new axios.Cancel('Request call failed');
                      })
                      .then(() => (options.onRetry ? options.onRetry(request) : request))
                : undefined;
        });
    }
    return cache.requestQueueInterceptorId;
};

/**
 * Ejects request queue interceptor and unset interceptor cached values.
 *
 * @param {AxiosInstance} instance
 * @param {AxiosAuthRefreshCache} cache
 */
export const unsetCache = (instance: AxiosInstance, cache: AxiosAuthRefreshCache): void => {
    if (cache.requestQueueInterceptorId) instance.interceptors.request.eject(cache.requestQueueInterceptorId);
    cache.requestQueueInterceptorId = undefined;
    cache.refreshCall = undefined;
    cache.skipInstances = cache.skipInstances.filter((skipInstance) => skipInstance !== instance);
};

/**
 * Returns instance that's going to be used when requests are retried
 *
 * @param instance
 * @param options
 */
export const getRetryInstance = (instance: AxiosInstance, options: AxiosAuthRefreshOptions): AxiosInstance =>
    options.retryInstance ?? instance;

/**
 * Resend failed axios request.
 *
 * @param {any} error
 * @param {AxiosInstance} instance
 * @return AxiosPromise
 */
export const resendFailedRequest = async (error: any, instance: AxiosInstance): Promise<AxiosResponse> => {
    error.config.skipAuthRefresh = true;
    return instance(error.response.config);
};
