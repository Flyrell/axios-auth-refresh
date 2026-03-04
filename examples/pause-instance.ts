/**
 * Deduplicate Refresh Example
 *
 * Demonstrates deduplicateRefresh with concurrent requests:
 * 1. The first request fails with 401 and triggers a (delayed) refresh
 * 2. While refresh is in progress, 4 more requests are fired
 * 3. Those requests are stalled by the request queue interceptor
 * 4. After refresh completes, all stalled requests go through with the new token
 * 5. The refresh runs only once
 */

import axios from 'axios';
import { createAuthRefresh } from '../src/index';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual } from './_helpers/assert';

const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

const instance = axios.create({
    adapter: createMockAdapter(state),
    headers: { Authorization: 'Bearer token-v1' },
});

// Request interceptor that always reads the latest token
instance.interceptors.request.use((config) => {
    if (state.refreshCount > 0) {
        config.headers['Authorization'] = `Bearer ${state.validToken}`;
    }
    return config;
});

createAuthRefresh(
    instance,
    async (failedRequest) => {
        // Small delay to give time for the other requests to be queued
        await new Promise((r) => setTimeout(r, 50));
        state.refreshCount++;
        state.validToken = 'token-v2';
        failedRequest.response.config.headers['Authorization'] = `Bearer ${state.validToken}`;
    },
    { deduplicateRefresh: true },
);

async function main() {
    // Fire the first request (will fail with 401 and trigger refresh)
    const firstRequest = instance.get('/protected');

    // Wait a tick so the refresh call starts and the request queue interceptor is set up
    await new Promise((r) => setTimeout(r, 10));

    // Fire 4 more requests while refresh is in progress — they get stalled
    const stalledRequests = Array.from({ length: 4 }, () => instance.get('/protected'));

    const responses = await Promise.all([firstRequest, ...stalledRequests]);

    for (let i = 0; i < responses.length; i++) {
        assertEqual(responses[i].status, 200, `Request ${i + 1} should succeed`);
    }

    assertEqual(state.refreshCount, 1, 'Refresh should have been called exactly once');

    console.log('  PASS  pause-instance');
}

main();
