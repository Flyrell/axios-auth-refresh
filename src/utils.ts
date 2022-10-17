import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { AxiosAuthRefreshOptions, AxiosAuthRefreshCache } from './model';
import type { AxiosAuthRefreshError } from './model';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}

export const defaultOptions: AxiosAuthRefreshOptions = {
    statusCodes: [401],
    pauseInstanceWhileRefreshing: false,
};

/**
 * A custom type guard function that determines whether `error` is an AxiosAuthRefreshError.
 * @param error
 */
export const isAxiosAuthRefreshError = (error: unknown): error is AxiosAuthRefreshError =>
    typeof error === 'object' && error !== null && 'config' in error;

/**
 * Merges two options objects (options overwrites defaults).
 * @param defaults
 * @param options
 */
export const mergeOptions = (
    defaults: AxiosAuthRefreshOptions,
    options: AxiosAuthRefreshOptions
): AxiosAuthRefreshOptions => ({ ...defaults, pauseInstanceWhileRefreshing: options.skipWhileRefreshing, ...options });

/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param error
 * @param options
 * @param instance
 * @param cache
 */
export const shouldInterceptError = <TError = unknown>(
    error: TError,
    options: AxiosAuthRefreshOptions,
    instance: AxiosInstance,
    cache: AxiosAuthRefreshCache
): boolean => {
    if (!isAxiosAuthRefreshError(error)) return false;

    if (error.config.skipAuthRefresh) {
        return false;
    }

    if (
        !(options.interceptNetworkError && !error.response && error.request.status === 0) &&
        (!error.response ||
            (options.shouldRefresh
                ? !options.shouldRefresh(error)
                : !options.statusCodes?.includes(
                      typeof error.response.status === 'string'
                          ? parseInt(error.response.status, 10)
                          : error.response.status
                  )))
    ) {
        return false;
    }

    // Copy config to response if there's a network error, so config can be modified and used in the retry
    if (!error.response) error.response = { config: error.config } as AxiosResponse;

    return !options.pauseInstanceWhileRefreshing || !cache.skipInstances.includes(instance);
};

/**
 * Creates refresh call if it does not exist or returns the existing one.
 * @param error
 * @param fn
 * @param cache
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const createRefreshCall = <TError = unknown>(
    error: TError,
    fn: (error: TError) => Promise<void>,
    cache: AxiosAuthRefreshCache
): Promise<void> => {
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
 * @param instance
 * @param cache
 * @param options
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
 * @param instance
 * @param cache
 */
export const unsetCache = (instance: AxiosInstance, cache: AxiosAuthRefreshCache): void => {
    if (cache.requestQueueInterceptorId) instance.interceptors.request.eject(cache.requestQueueInterceptorId);
    cache.requestQueueInterceptorId = undefined;
    cache.refreshCall = undefined;
    cache.skipInstances = cache.skipInstances.filter((skipInstance) => skipInstance !== instance);
};

/**
 * Returns instance that's going to be used when requests are retried.
 * @param instance
 * @param options
 */
export const getRetryInstance = (instance: AxiosInstance, options: AxiosAuthRefreshOptions): AxiosInstance =>
    options.retryInstance ?? instance;

/**
 * Resend failed axios request.
 * @param error
 * @param instance
 */
export const resendFailedRequest = async <TError = unknown>(
    error: TError,
    instance: AxiosInstance
): Promise<AxiosResponse | undefined> => {
    if (!isAxiosAuthRefreshError(error) || !error.response?.config) return undefined;

    error.config.skipAuthRefresh = true;
    return instance(error.response.config);
};
