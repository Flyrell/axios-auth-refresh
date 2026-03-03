/**
 * Skip Auth Refresh Example
 *
 * Demonstrates the skipAuthRefresh flag:
 * 1. A request with `skipAuthRefresh: true` that fails with 401 is NOT intercepted — it rejects
 * 2. A normal request without the flag triggers the refresh logic as expected
 */

import axios from 'axios';
import createAuthRefreshInterceptor from '../src/index';
import { AxiosAuthRefreshRequestConfig } from '../src/model';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual, assert } from './_helpers/assert';

const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

const instance = axios.create({
    adapter: createMockAdapter(state),
    headers: { Authorization: 'Bearer token-v1' },
});

createAuthRefreshInterceptor(instance, async (failedRequest) => {
    state.refreshCount++;
    state.validToken = 'token-v2';
    failedRequest.response.config.headers['Authorization'] = `Bearer ${state.validToken}`;
});

async function main() {
    // 1. Request with skipAuthRefresh should reject with 401
    try {
        await instance.get('/protected', { skipAuthRefresh: true } as AxiosAuthRefreshRequestConfig);
        assert(false, 'Request with skipAuthRefresh should have rejected');
    } catch (error: any) {
        assertEqual(error.response.status, 401, 'Skipped request should get 401');
        assertEqual(state.refreshCount, 0, 'Refresh should NOT have been called');
    }

    // 2. Normal request triggers refresh
    const response = await instance.get('/protected');
    assertEqual(response.status, 200, 'Normal request should succeed after refresh');
    assertEqual(state.refreshCount, 1, 'Refresh should have been called once');

    console.log('  PASS  skip-auth-refresh');
}

main();
