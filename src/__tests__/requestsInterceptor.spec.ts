import { AxiosAuthRefreshCache, AxiosAuthRefreshRequestConfig } from '../model';
import { mockedAxios, sleep } from '../testUtil';
import {
    createRefreshCall,
    createRequestQueueInterceptor,
    defaultOptions,
    getRetryInstance,
    mergeOptions,
} from '../utils';
import axios, { AxiosRequestConfig } from 'axios';

describe('Requests interceptor', () => {
    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined,
        };
    });

    it('is created', () => {
        const mock = mockedAxios();
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(mock, cache, {});
        expect(mock.interceptors.has('request', result1)).toBeTruthy();
        mock.interceptors.request.eject(result1);
    });

    it('is created only once', () => {
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(axios.create(), cache, {});
        const result2 = createRequestQueueInterceptor(axios.create(), cache, {});
        expect(result1).toBe(result2);
    });

    it('intercepts the requests', async () => {
        try {
            let refreshed = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(instance, cache, {});
            createRefreshCall(
                {},
                async () => {
                    await sleep(400);
                    ++refreshed;
                },
                cache
            );
            await instance.get('http://example.com').then(() => expect(refreshed).toBe(1));
            await instance.get('http://example.com').then(() => expect(refreshed).toBe(1));
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    it("doesn't intercept skipped request", async () => {
        try {
            let refreshed = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(instance, cache, {});
            createRefreshCall(
                {},
                async () => {
                    await sleep(400);
                    ++refreshed;
                },
                cache
            );
            await instance.get('http://example.com').then(() => expect(refreshed).toBe(1));
            await instance
                .get('http://example.com', <AxiosAuthRefreshRequestConfig>{ skipAuthRefresh: true })
                .then(() => expect(refreshed).toBe(1));
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    it('cancels all requests when refreshing call failed', async () => {
        try {
            let passed = 0,
                caught = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(instance, cache, {});
            createRefreshCall(
                {},
                async () => {
                    await sleep(500);
                    return Promise.reject();
                },
                cache
            );
            await instance
                .get('http://example.com')
                .then(() => ++passed)
                .catch(() => ++caught);
            await instance
                .get('http://example.com')
                .then(() => ++passed)
                .catch(() => ++caught);
            expect(passed).toBe(0);
            expect(caught).toBe(2);
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    it('uses the correct instance of axios to retry requests', () => {
        const instance = axios.create();
        const options = mergeOptions(defaultOptions, {});
        const result = getRetryInstance(instance, options);
        expect(result).toBe(instance);

        const retryInstance = axios.create();
        const optionsWithRetryInstance = mergeOptions(defaultOptions, { retryInstance });
        const resultWithRetryInstance = getRetryInstance(instance, optionsWithRetryInstance);
        expect(resultWithRetryInstance).toBe(retryInstance);
    });

    it('calls the onRetry callback before retrying the request', async () => {
        const instance = axios.create();
        const onRetry = jest.fn((requestConfig: AxiosRequestConfig) => requestConfig);
        createRequestQueueInterceptor(instance, cache, { onRetry });
        createRefreshCall(
            {},
            async () => {
                await sleep(500);
                return Promise.resolve();
            },
            cache
        );
        await instance.get('http://example.com');
        expect(onRetry).toHaveBeenCalled();
    });
});
