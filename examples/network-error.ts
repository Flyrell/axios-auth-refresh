/**
 * Network Error Interception Example
 *
 * Demonstrates interceptNetworkError for CORS scenarios:
 * 1. The adapter simulates a network error (no response, request.status === 0)
 * 2. With interceptNetworkError: true, the refresh logic runs
 * 3. After refresh, the adapter is swapped to one that succeeds
 */

import axios from 'axios';
import { createAuthRefresh } from '../src/index';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual } from './_helpers/assert';

const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

// Start with a network-error adapter
const networkErrorAdapter = createMockAdapter(state, { networkError: true });
const successAdapter = createMockAdapter(state);

const instance = axios.create({
    adapter: networkErrorAdapter,
    headers: { Authorization: 'Bearer token-v1' },
});

createAuthRefresh(
    instance,
    async (failedRequest) => {
        state.refreshCount++;
        state.validToken = 'token-v2';

        // After refresh, swap to the success adapter and fix the token
        instance.defaults.adapter = successAdapter;
        failedRequest.response = failedRequest.response || {};
        (failedRequest.config || failedRequest.response.config).headers['Authorization'] = `Bearer ${state.validToken}`;
    },
    { interceptNetworkError: true },
);

async function main() {
    const response = await instance.get('/protected');

    assertEqual(response.status, 200, 'Request should succeed after network error refresh');
    assertEqual(state.refreshCount, 1, 'Refresh called once');

    console.log('  PASS  network-error');
}

main();
