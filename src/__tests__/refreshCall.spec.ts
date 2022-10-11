import { AxiosAuthRefreshCache } from '../model';
import { createRefreshCall } from '../utils';

describe('Creates refresh call', () => {
    let cache: AxiosAuthRefreshCache = undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined,
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
