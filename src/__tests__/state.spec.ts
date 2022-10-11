import { AxiosAuthRefreshCache } from '../model';
import { mockedAxios } from './testUtil';
import { unsetCache } from '../utils';

describe('State is cleared', () => {
    const cache: AxiosAuthRefreshCache = {
        skipInstances: [],
        refreshCall: undefined,
        requestQueueInterceptorId: undefined,
    };

    it('after refreshing call succeeds/fails', () => {
        const instance = mockedAxios();
        cache.requestQueueInterceptorId = instance.interceptors.request.use(() => undefined);
        cache.skipInstances.push(instance);
        expect(instance.interceptors.has('request', cache.requestQueueInterceptorId)).toBeTruthy();
        expect(cache.skipInstances.length).toBe(1);
        unsetCache(instance, cache);
        expect(cache.skipInstances.length).toBe(0);
        expect(cache.requestQueueInterceptorId).toBeFalsy();
        expect(instance.interceptors.has('request', cache.requestQueueInterceptorId)).toBeFalsy();
    });
});
