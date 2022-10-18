import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { AxiosAuthRefreshCache, AxiosAuthRefreshOptions, AxiosAuthRefreshRequestConfig } from '../model';

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
        cache.requestQueueInterceptorId = instance.interceptors.request.use(
            (request: AxiosAuthRefreshRequestConfig) => {
                if (request.skipAuthRefresh) return request;
                return cache.refreshCall
                    ? cache.refreshCall
                          .catch(() => {
                              throw new axios.Cancel('Request call failed');
                          })
                          .then(() => (options.onRetry ? options.onRetry(request) : request))
                    : undefined;
            }
        );
    }
    return cache.requestQueueInterceptorId;
};
