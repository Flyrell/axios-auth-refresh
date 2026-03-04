/**
 * Custom Status Codes Example
 *
 * Demonstrates:
 * (a) statusCodes: [401, 403] — refresh triggers on 403
 * (b) shouldRefresh callback — inspects the error body to decide
 */

import axios, { AxiosError } from 'axios';
import { createAuthRefresh } from '../src/index';
import { createMockAdapter, MockState } from './_helpers/mock-adapter';
import { assertEqual } from './_helpers/assert';

// --- (a) statusCodes: [401, 403] ---

async function testStatusCodes() {
    const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

    const instance = axios.create({
        adapter: createMockAdapter(state, { errorStatus: 403 }),
        headers: { Authorization: 'Bearer token-v1' },
    });

    createAuthRefresh(
        instance,
        async (failedRequest) => {
            state.refreshCount++;
            state.validToken = 'token-v2';
            failedRequest.response.config.headers['Authorization'] = `Bearer ${state.validToken}`;
        },
        { statusCodes: [401, 403] },
    );

    const response = await instance.get('/protected');
    assertEqual(response.status, 200, '(a) Should refresh on 403');
    assertEqual(state.refreshCount, 1, '(a) Refresh called once');
}

// --- (b) shouldRefresh callback ---

async function testShouldRefresh() {
    const state: MockState = { validToken: 'token-v2', refreshCount: 0 };

    const instance = axios.create({
        adapter: createMockAdapter(state),
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
            shouldRefresh: (error: AxiosError<{ message: string }>) =>
                error?.response?.data?.message === 'Invalid token',
        },
    );

    const response = await instance.get('/protected');
    assertEqual(response.status, 200, '(b) shouldRefresh matched');
    assertEqual(state.refreshCount, 1, '(b) Refresh called once');
}

async function main() {
    await testStatusCodes();
    await testShouldRefresh();

    console.log('  PASS  custom-status-codes');
}

main();
