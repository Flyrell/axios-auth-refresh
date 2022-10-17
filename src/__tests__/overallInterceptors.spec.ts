import createAuthRefreshInterceptor from '../index';
import axios from 'axios';

describe('Creates the overall interceptor correctly', () => {
    it('throws error when no function provided', () => {
        expect(() => createAuthRefreshInterceptor(axios, null as any)).toThrow();
    });

    it('returns interceptor id', () => {
        const id = createAuthRefreshInterceptor(axios, async () => Promise.resolve());
        expect(typeof id).toBe('number');
        expect(id).toBeGreaterThan(-1);
    });

    it('does not change the interceptors queue', async () => {
        try {
            const instance = axios.create();
            const id = createAuthRefreshInterceptor(axios, async () => instance.get('https://httpstat.us/200'));
            const id2 = instance.interceptors.response.use(
                (req) => req,
                async (error) => Promise.reject(error)
            );
            // @ts-expect-error
            const interceptor1 = instance.interceptors.response.handlers[id];
            // @ts-expect-error
            const interceptor2 = instance.interceptors.response.handlers[id2];
            try {
                await instance.get('https://httpstat.us/401');
            } catch (e) {
                // Ignore error as it's 401 all over again
            }
            // @ts-expect-error
            const interceptor1__after = instance.interceptors.response.handlers[id];
            // @ts-expect-error
            const interceptor2__after = instance.interceptors.response.handlers[id2];
            expect(interceptor1).toBe(interceptor1__after);
            expect(interceptor2).toBe(interceptor2__after);
            return;
        } catch (e) {
            return await Promise.reject();
        }
    });
});
