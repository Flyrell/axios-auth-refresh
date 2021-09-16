import { AxiosAuthRefreshCache, AxiosAuthRefreshRequestConfig } from '../model';
import axios, { AxiosRequestConfig, AxiosStatic } from 'axios';
import createAuthRefreshInterceptor, { AxiosAuthRefreshOptions } from "../index";
import {
    unsetCache,
    mergeOptions,
    defaultOptions,
    getRetryInstance,
    createRefreshCall,
    shouldInterceptError,
    createRequestQueueInterceptor,
} from "../utils";

const mockedAxios: () => AxiosStatic | any = () => {
    const bag = {
        request: [],
        response: [],
        has: jest.fn((type: 'request'|'response', id: number) => bag[type].includes(id))
    };
    return {
        interceptors: {
            request: {
                use: jest.fn(() => {
                    const i = Math.random();
                    bag.request.push(i);
                    return i;
                }),
                eject: jest.fn((i) => {
                    bag.request = bag.request.filter(n => n !== i);
                })
            },
            response: {
                use: jest.fn(() => {
                    const i = Math.random();
                    bag.response.push(i);
                    return i;
                }),
                eject: jest.fn((i) => {
                    bag.response = bag.response.filter(n => n !== i);
                })
            },
            has: bag.has
        },
        defaults: {
            params: {}
        }
    };
};

const sleep = (ms) => {
    return new Promise((resolve) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            resolve('OK');
        }, ms);
    });
};

describe('Merges configs', () => {

    it('source and target are the same', () => {
        const source: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [ 204 ] });
    });

    it('source is different than the target', () => {
        const source: AxiosAuthRefreshOptions = { statusCodes: [ 302 ] };
        const target: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [ 302 ] });
    });

    it('source is empty', () => {
        const source: AxiosAuthRefreshOptions = {};
        const target: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeOptions(target, source)).toEqual({ statusCodes: [ 204 ] });
    });
});

describe('Determines if the response should be intercepted', () => {

    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined
        };
    });

    const options = { statusCodes: [ 401 ] };

    it('no error object provided', () => {
        expect(shouldInterceptError(undefined, options, axios, cache)).toBeFalsy();
    });

    it('no response inside error object', () => {
        expect(shouldInterceptError({}, options, axios, cache)).toBeFalsy();
    });

    it('no status in error.response object', () => {
        expect(shouldInterceptError({ response: {} }, options, axios, cache)).toBeFalsy();
    });

    it('error does not include the response status', () => {
        expect(shouldInterceptError({ response: { status: 403 } }, options, axios, cache)).toBeFalsy();
    });

    it('error includes the response status', () => {
        expect(shouldInterceptError({ response: { status: 401 } }, options, axios, cache)).toBeTruthy();
    });

    it('error has response status specified as a string', () => {
        expect(shouldInterceptError({ response: { status: '401' } }, options, axios, cache)).toBeTruthy();
    });

    it('when skipAuthRefresh flag is set ot true', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: true }
        };
        expect(shouldInterceptError(error, options, axios, cache)).toBeFalsy();
    });

    it('when skipAuthRefresh flag is set to false', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: false }
        };
        expect(shouldInterceptError(error, options, axios, cache)).toBeTruthy();
    });

    it('when pauseInstanceWhileRefreshing flag is not provided', () => {
        const error = {
            response: { status: 401 },
        };
        expect(shouldInterceptError(error, options, axios, cache)).toBeTruthy();
    });

    it('when pauseInstanceWhileRefreshing flag is set to true', () => {
        const error = {
            response: { status: 401 },
        };
        const newCache = { ...cache, skipInstances: [ axios ] };
        const newOptions = { ...options, pauseInstanceWhileRefreshing: true };
        expect(shouldInterceptError(error, newOptions, axios, newCache)).toBeFalsy();
    });

    it('when pauseInstanceWhileRefreshing flag is set to false', () => {
        const error = {
            response: { status: 401 },
        };
        const newOptions = { ...options, pauseInstanceWhileRefreshing: false };
        expect(shouldInterceptError(error, newOptions, axios, cache)).toBeTruthy();
    });
});

describe('Creates refresh call', () => {

    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined
        };
    });

    it('warns if refreshTokenCall does not return a promise', async () => {

        // Just so we don't trigger the console.warn (looks better in terminal)
        const tmp = console.warn;
        const mocked = jest.fn();
        console.warn = mocked;

        try {
            await createRefreshCall({}, () => Promise.resolve(), cache);
        } catch (e) {
            expect(mocked).toBeCalled();
        }

        console.warn = tmp;
    });

    it('creates refreshTokenCall and correctly resolves', async () => {
        try {
            const result = await createRefreshCall({}, () => Promise.resolve('hello world'), cache);
            expect(result).toBe('hello world');
        } catch (e) {
            expect(true).toBe(false);
        }
    });

    it('creates refreshTokenCall and correctly rejects', async () => {
        try {
            await createRefreshCall({}, () => Promise.reject('goodbye world'), cache);
        } catch (e) {
            expect(e).toBe('goodbye world');
        }
    });

    it('creates only one instance of refreshing call', () => {
        const refreshTokenCall = () => Promise.resolve('hello world');
        const result1 = createRefreshCall({}, refreshTokenCall, cache);
        const result2 = createRefreshCall({}, refreshTokenCall, cache);
        expect(result1).toBe(result2);
    });
});

describe('Requests interceptor', () => {

    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined
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
            createRefreshCall({}, async () => {
                await sleep(400);
                ++refreshed;
            }, cache);
            await instance.get('http://example.com').then(() => expect(refreshed).toBe(1));
            await instance.get('http://example.com').then(() => expect(refreshed).toBe(1));
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    it('doesn\'t intercept skipped request', async () => {
        try {
            let refreshed = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(instance, cache, {});
            createRefreshCall({}, async () => {
                await sleep(400);
                ++refreshed;
            }, cache);
            await instance.get('http://example.com')
              .then(() => expect(refreshed).toBe(1));
            await instance.get('http://example.com', <AxiosAuthRefreshRequestConfig>{ skipAuthRefresh: true })
              .then(() => expect(refreshed).toBe(1));
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });

    it('cancels all requests when refreshing call failed', async () => {
        try {
            let passed = 0, caught = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(instance, cache, {});
            createRefreshCall({}, async () => {
                await sleep(500);
                return Promise.reject();
            }, cache);
            await instance.get('http://example.com').then(() => ++passed).catch(() => ++caught);
            await instance.get('http://example.com').then(() => ++passed).catch(() => ++caught);
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
        createRefreshCall({}, async () => {
            await sleep(500);
            return Promise.resolve();
        }, cache);
        await instance.get('http://example.com');
        expect(onRetry).toHaveBeenCalled();
    });
});

describe('Creates the overall interceptor correctly', () => {

    it('throws error when no function provided', () => {
        expect(() => createAuthRefreshInterceptor(axios, null)).toThrow();
    });

    it('returns interceptor id', () => {
        const id = createAuthRefreshInterceptor(axios, () => Promise.resolve());
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(-1);
    });

    it('does not change the interceptors queue', async () => {
        try {
            const instance = axios.create();
            const id = createAuthRefreshInterceptor(
                axios,
                () => instance.get('https://httpstat.us/200')
            );
            const id2 = instance.interceptors.response.use(req => req, error => Promise.reject(error));
            const interceptor1 = instance.interceptors.response['handlers'][id];
            const interceptor2 = instance.interceptors.response['handlers'][id2];
            try {
                await instance.get('https://httpstat.us/401');
            } catch (e) {
                // Ignore error as it's 401 all over again
            }
            const interceptor1__after = instance.interceptors.response['handlers'][id];
            const interceptor2__after = instance.interceptors.response['handlers'][id2];
            expect(interceptor1).toBe(interceptor1__after);
            expect(interceptor2).toBe(interceptor2__after);
        } catch (e) {
            return await Promise.reject();
        }
    });
});

describe('State is cleared', () => {

    const cache: AxiosAuthRefreshCache = {
        skipInstances: [],
        refreshCall: undefined,
        requestQueueInterceptorId: undefined
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
