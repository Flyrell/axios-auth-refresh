import type { AxiosAuthRefreshCache } from '../../model';
import { unsetCache } from '../unsetCache';
import { axiosMock } from '../../test/axiosMock';

describe('State is cleared', () => {
    const cache: AxiosAuthRefreshCache = {
        skipInstances: [],
        refreshCall: undefined,
        requestQueueInterceptorId: undefined,
    };

    it('after refreshing call succeeds/fails', () => {
        const instance = axiosMock();
        cache.requestQueueInterceptorId = instance.interceptors.request.use(() => undefined);
        cache.skipInstances.push(instance as any);
        expect(instance.interceptors.has('request', cache.requestQueueInterceptorId)).toBeTruthy();
        expect(cache.skipInstances.length).toBe(1);
        unsetCache(instance as any, cache);
        expect(cache.skipInstances.length).toBe(0);
        expect(cache.requestQueueInterceptorId).toBeFalsy();
        expect(instance.interceptors.has('request', cache.requestQueueInterceptorId)).toBeFalsy();
    });
});
