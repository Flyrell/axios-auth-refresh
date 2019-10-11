import axios, { AxiosStatic } from 'axios';
import createAuthRefreshInterceptor, {
    mergeConfigs,
    shouldInterceptError,
    createRefreshCall,
    createRequestQueueInterceptor,
    AxiosAuthRefreshOptions,
    AxiosAuthRefreshCache
} from "../index";

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

    it('master and slave are the same', () => {
        const master: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        const slave: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeConfigs(master, slave)).toEqual({ statusCodes: [ 204 ] });
    });

    it('master is different than the slave', () => {
        const master: AxiosAuthRefreshOptions = { statusCodes: [ 302 ] };
        const slave: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeConfigs(master, slave)).toEqual({ statusCodes: [ 302 ] });
    });

    it('master is empty', () => {
        const master: AxiosAuthRefreshOptions = {};
        const slave: AxiosAuthRefreshOptions = { statusCodes: [ 204 ] };
        expect(mergeConfigs(master, slave)).toEqual({ statusCodes: [ 204 ] });
    });
});

describe('Uses options correctly', () => {

    it('uses only the axios instance provided in options', () => {
        const instanceWithInterceptor = mockedAxios();
        const instanceWithoutInterceptor = mockedAxios();
        const id = createAuthRefreshInterceptor(axios, () => Promise.resolve(), {
            instance: instanceWithInterceptor
        });
        expect(instanceWithInterceptor.interceptors.has('response', id)).toBeTruthy();
        expect(instanceWithoutInterceptor.interceptors.has('response', id)).toBeFalsy();
    });
});

describe('Determines if the response should be intercepted', () => {

    const options = { statusCodes: [ 401 ] };

    it('no error object provided', () => {
        expect(shouldInterceptError(undefined, options, axios)).toBeFalsy();
    });

    it('no response inside error object', () => {
        expect(shouldInterceptError({}, options, axios)).toBeFalsy();
    });

    it('no status in error.response object', () => {
        expect(shouldInterceptError({ response: {} }, options, axios)).toBeFalsy();
    });

    it('error does not include the response status', () => {
        expect(shouldInterceptError({ response: { status: 403 } }, options, axios)).toBeFalsy();
    });

    it('error includes the response status', () => {
        expect(shouldInterceptError({ response: { status: 401 } }, options, axios)).toBeTruthy();
    });

    it('error has response status specified as a string', () => {
        expect(shouldInterceptError({ response: { status: '401' } }, options, axios)).toBeTruthy();
    });

    it('when skipAuthRefresh flag is set ot true', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: true }
        };
        expect(shouldInterceptError(error, options, axios)).toBeFalsy();
    });

    it('when skipAuthRefresh flag is set to false', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: false }
        };
        expect(shouldInterceptError(error, options, axios)).toBeTruthy();
    });
});

describe('Creates refresh call', () => {

    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
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
            refreshCall: undefined,
            requestQueueInterceptorId: undefined
        };
    });

    it('is created', () => {
        const mock = mockedAxios();
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(mock, mock, cache);
        expect(mock.interceptors.has('request', result1)).toBeTruthy();
        mock.interceptors.request.eject(result1);
    });

    it('is created only once', () => {
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(axios, axios.create(), cache);
        const result2 = createRequestQueueInterceptor(axios, axios.create(), cache);
        expect(result1).toBe(result2);
    });

    it('intercepts the requests', async () => {
        try {
            let refreshed = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(axios, instance, cache);
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

    it('cancels all requests when refreshing call failed', async () => {
        try {
            let passed = 0, caught = 0;
            const instance = axios.create();
            createRequestQueueInterceptor(axios, instance, cache);
            createRefreshCall({}, async () => {
                await sleep(500);
                return Promise.reject();
            }, cache);
            await instance.get('http://example.com')
                .then(() => ++passed)
                .catch(() => ++caught);
            await instance.get('http://example.com')
                .then(() => ++passed)
                .catch(() => ++caught);
            expect(passed).toBe(0);
            expect(caught).toBe(2);
        } catch (e) {
            expect(e).toBeFalsy();
        }
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
            const id = createAuthRefreshInterceptor(axios, () => instance.get('https://httpstat.us/200'), { instance });
            const interceptor1 = instance.interceptors.response['handlers'][id];
            const id2 = instance.interceptors.response.use(req => req, error => Promise.reject(error));
            const interceptor2 = instance.interceptors.response['handlers'][id2];
            try {
                await instance.get('https://httpstat.us/401');
            } catch (e) {
                // Ignore error
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
