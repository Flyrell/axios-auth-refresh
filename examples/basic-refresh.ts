/**
 * Basic Refresh Example
 *
 * Demonstrates the core 401 → refresh → retry flow:
 * 1. A request fails with 401 (invalid token)
 * 2. The refresh logic runs and updates the token
 * 3. The original request is retried with the new token and succeeds
 */

import axios from 'axios';
import createAuthRefreshInterceptor from '../src/index';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual } from './_helpers/assert';

const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

const instance = axios.create({
    adapter: createMockAdapter(state),
    headers: { Authorization: 'Bearer token-v1' }, // starts with an expired token
});

createAuthRefreshInterceptor(instance, async (failedRequest) => {
    state.refreshCount++;
    // Simulate obtaining a new token
    state.validToken = 'token-v2';
    failedRequest.response.config.headers['Authorization'] = `Bearer ${state.validToken}`;
});

async function main() {
    const response = await instance.get('/protected');

    assertEqual(response.status, 200, 'Response status should be 200');
    assertEqual(state.refreshCount, 1, 'Refresh should have been called exactly once');

    console.log('  PASS  basic-refresh');
}

main();
