import type { AxiosAuthRefreshCache } from '../model';

/**
 * Creates refresh call if it does not exist or returns the existing one.
 * @param error
 * @param fn
 * @param cache
 */
// eslint-disable-next-line @typescript-eslint/promise-function-async
export const createRefreshCall = (
    error: unknown,
    fn: (error: unknown) => Promise<void>,
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
