import type { AxiosAuthRefreshCache } from '../model';
import { createRefreshCall } from '../utils';

describe('Creates refresh call', () => {
    let cache: AxiosAuthRefreshCache | undefined;
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
            await createRefreshCall({}, async () => Promise.resolve(), cache as any);
        } catch (e) {
            expect(mocked).toBeCalled();
        }

        console.warn = tmp;
    });

    it('creates refreshTokenCall and correctly resolves', async () => {
        try {
            const result = await createRefreshCall({}, async () => Promise.resolve('hello world' as any), cache as any);
            expect(result).toBe('hello world');
        } catch (e) {
            expect(true).toBe(false);
        }
    });

    it('creates refreshTokenCall and correctly rejects', async () => {
        try {
            await createRefreshCall({}, async () => Promise.reject('goodbye world'), cache as any);
        } catch (e) {
            expect(e).toBe('goodbye world');
        }
    });

    it('creates only one instance of refreshing call', () => {
        const refreshTokenCall = async () => Promise.resolve('hello world');
        const result1 = createRefreshCall({}, refreshTokenCall as any, cache as any);
        const result2 = createRefreshCall({}, refreshTokenCall as any, cache as any);
        expect(result1).toBe(result2);
    });
});
