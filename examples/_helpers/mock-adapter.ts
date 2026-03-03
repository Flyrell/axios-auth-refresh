import { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

export interface MockState {
    validToken: string;
    refreshCount: number;
}

export interface MockAdapterOptions {
    /** Status code returned for unauthorized requests (default: 401) */
    errorStatus?: number;
    /** Simulate a network error instead of an HTTP error */
    networkError?: boolean;
}

/**
 * Creates a mock axios adapter that simulates token-based auth.
 *
 * - Requests with `Authorization: Bearer <state.validToken>` → 200
 * - Otherwise → configurable error status or network error
 *
 * The caller owns the `state` object and can mutate `state.validToken`
 * from refresh logic so subsequent requests succeed.
 */
export function createMockAdapter(state: MockState, options: MockAdapterOptions = {}) {
    const { errorStatus = 401, networkError = false } = options;

    return (config: InternalAxiosRequestConfig): Promise<any> => {
        const auth = config.headers?.['Authorization'] as string | undefined;

        if (auth === `Bearer ${state.validToken}`) {
            return Promise.resolve({
                data: { ok: true },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            });
        }

        if (networkError) {
            const error = new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, { status: 0 });
            return Promise.reject(error);
        }

        const error = new AxiosError('Unauthorized', AxiosError.ERR_BAD_REQUEST, config, {}, {
            data: { message: 'Invalid token' },
            status: errorStatus,
            statusText: 'Unauthorized',
            headers: {},
            config,
        } as any);
        return Promise.reject(error);
    };
}
