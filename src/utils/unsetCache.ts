import type { AxiosInstance } from 'axios';

import type { AxiosAuthRefreshCache } from '../model';

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
