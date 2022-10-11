import createAuthRefreshInterceptor from '../index';
import axios from 'axios';

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
            const id = createAuthRefreshInterceptor(axios, () => instance.get('https://httpstat.us/200'));
            const id2 = instance.interceptors.response.use(
                (req) => req,
                (error) => Promise.reject(error)
            );
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
