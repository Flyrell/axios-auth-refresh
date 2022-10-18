import type { AxiosAuthRefreshCache, AxiosAuthRefreshOptions } from '../../model';
import axios from 'axios';
import { shouldInterceptError } from '../shouldInterceptError';

describe('Determines if the response should be intercepted', () => {
    let cache: AxiosAuthRefreshCache | undefined;
    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined,
        };
    });

    const options = { statusCodes: [401] };

    it('no error object provided', () => {
        expect(shouldInterceptError(undefined, options, axios, cache as any)).toBeFalsy();
    });

    it('no response inside error object', () => {
        expect(shouldInterceptError({}, options, axios, cache as any)).toBeFalsy();
    });

    it('no status in error.response object', () => {
        expect(shouldInterceptError({ response: {} }, options, axios, cache as any)).toBeFalsy();
    });

    it('error does not include the response status', () => {
        expect(shouldInterceptError({ response: { status: 403 } }, options, axios, cache as any)).toBeFalsy();
    });

    it('error includes the response status', () => {
        expect(
            shouldInterceptError({ response: { status: 401 }, config: {} }, options, axios, cache as any)
        ).toBeTruthy();
    });

    it('error has response status specified as a string', () => {
        expect(
            shouldInterceptError({ response: { status: '401' }, config: {} }, options, axios, cache as any)
        ).toBeTruthy();
    });

    it('when skipAuthRefresh flag is set ot true', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: true },
        };
        expect(shouldInterceptError(error, options, axios, cache as any)).toBeFalsy();
    });

    it('when skipAuthRefresh flag is set to false', () => {
        const error = {
            response: { status: 401 },
            config: { skipAuthRefresh: false },
        };
        expect(shouldInterceptError(error, options, axios, cache as any)).toBeTruthy();
    });

    it('when pauseInstanceWhileRefreshing flag is not provided', () => {
        const error = { response: { status: 401 }, config: {} };
        expect(shouldInterceptError(error, options, axios, cache as any)).toBeTruthy();
    });

    it('when pauseInstanceWhileRefreshing flag is set to true', () => {
        const error = {
            response: { status: 401 },
        };
        const newCache = { ...cache, skipInstances: [axios] };
        const newOptions = { ...options, pauseInstanceWhileRefreshing: true };
        expect(shouldInterceptError(error, newOptions, axios, newCache as any)).toBeFalsy();
    });

    it('when pauseInstanceWhileRefreshing flag is set to false', () => {
        const error = { response: { status: 401 }, config: {} };
        const newOptions = { ...options, pauseInstanceWhileRefreshing: false };
        expect(shouldInterceptError(error, newOptions, axios, cache as any)).toBeTruthy();
    });

    it('when shouldRefresh return true', () => {
        const error = { response: { status: 401 }, config: {} };
        const newOptions: AxiosAuthRefreshOptions = { ...options, shouldRefresh: () => true };
        expect(shouldInterceptError(error, newOptions, axios, cache as any)).toBeTruthy();
    });

    it('when shouldRefresh return false', () => {
        const error = {
            response: { status: 401 },
        };
        const newOptions: AxiosAuthRefreshOptions = { ...options, shouldRefresh: () => false };
        expect(shouldInterceptError(error, newOptions, axios, cache as any)).toBeFalsy();
    });
});
