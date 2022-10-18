import type { AxiosAuthRefreshCache, AxiosAuthRefreshOptions } from '../model';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { isAxiosAuthRefreshError } from './isAxiosAuthRefreshError';

/**
 * Determines if the response should be intercepted
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param error
 * @param options
 * @param instance
 * @param cache
 */
export const shouldInterceptError = (
    error: unknown,
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
