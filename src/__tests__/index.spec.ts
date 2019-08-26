import axios, {AxiosInstance} from 'axios';
import {AxiosAuthRefreshCache, AxiosAuthRefreshOptions} from "../types";
import {
    mergeConfigs,
    shouldInterceptError,
    createRefreshCall,
    createRequestQueueInterceptor
} from "../index";

const bag = {
    request: [],
    response: [],
    has: jest.fn((type: 'request'|'response', i: number) => bag[type].includes(i))
};

const mockedAxios: AxiosInstance | any = {
    get: jest.fn((result: any) => result ? Promise.resolve(result) : Promise.reject(result)),
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
        }
    }
};

const sleep = (ms) => {
    return new Promise((resolve) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            resolve('OK');
        }, ms);
    });
};





describe('Config merge', () => {

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

describe('Intercepts requests', () => {

    const options = { statusCodes: [ 401 ] };

    it('has no error object', () => {
        expect(shouldInterceptError(undefined, options)).toBeFalsy();
    });

    it('has no response inside error object', () => {
        expect(shouldInterceptError({}, options)).toBeFalsy();
    });

    it('has no status in error.response object', () => {
        expect(shouldInterceptError({ response: {} }, options)).toBeFalsy();
    });

    it('does not include the response status', () => {
        expect(shouldInterceptError({ response: { status: 403 } }, options)).toBeFalsy();
    });

    it('does include the response status', () => {
        expect(shouldInterceptError({ response: { status: 401 } }, options)).toBeTruthy();
    });

    it('has response status specified as a string', () => {
        expect(shouldInterceptError({ response: { status: '401' } }, options)).toBeTruthy();
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

    it('warns if refreshTokenCall does not return promise', async () => {

        // Just so we don't trigger the console.warn (looks better in terminal)
        const warn = console.warn;
        const mocked = jest.fn();
        console.warn = mocked;

        try {
            await createRefreshCall({}, () => <any> false, cache);
        } catch (e) {
            expect(mocked).toBeCalled();
        }

        console.warn = warn;
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
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(mockedAxios, cache);
        expect(bag.has('request', result1)).toBeTruthy();
    });

    it('is created only once', () => {
        createRefreshCall({}, () => Promise.resolve(), cache);
        const result1 = createRequestQueueInterceptor(axios, cache);
        const result2 = createRequestQueueInterceptor(axios, cache);
        expect(result1).toBe(result2);
    });

    it('intercepts the requests', async () => {
        try {
            let refreshed = 0;
            createRequestQueueInterceptor(axios, cache);
            createRefreshCall({}, async () => {
                await sleep(400);
                ++refreshed;
            }, cache);
            await axios.get('http://example.com').then(() => expect(refreshed).toBe(1));
            await axios.get('http://example.com').then(() => expect(refreshed).toBe(1));
        } catch (e) {
            expect(e).toBeFalsy();
        }
    });
});
