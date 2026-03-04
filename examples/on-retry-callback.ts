/**
 * onRetry Callback Example
 *
 * Demonstrates using the onRetry option to mutate the request config
 * before a failed request is retried. Here we add a custom header
 * and verify the mock adapter sees it on the retried request.
 */

import axios from 'axios';
import { createAuthRefresh } from '../src/index';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual, assert } from './_helpers/assert';

const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

let retryHeaderSeen = false;

// Custom adapter that also checks for the X-Retry header
const baseAdapter = createMockAdapter(state);
const checkingAdapter = (config: any) => {
    if (config.headers?.['X-Retry'] === 'true') {
        retryHeaderSeen = true;
    }
    return baseAdapter(config);
};

const instance = axios.create({
    adapter: checkingAdapter,
    headers: { Authorization: 'Bearer token-v1' },
});

createAuthRefresh(
    instance,
    async (failedRequest) => {
        state.refreshCount++;
        state.validToken = 'token-v2';
        failedRequest.response.config.headers['Authorization'] = `Bearer ${state.validToken}`;
    },
    {
        onRetry: (requestConfig) => {
            requestConfig.headers['X-Retry'] = 'true';
            return requestConfig;
        },
    },
);

async function main() {
    const response = await instance.get('/protected');

    assertEqual(response.status, 200, 'Request should succeed after retry');
    assertEqual(state.refreshCount, 1, 'Refresh called once');
    assert(retryHeaderSeen, 'X-Retry header should be present on retried request');

    console.log('  PASS  on-retry-callback');
}

main();
