import type { AxiosAuthRefreshCache, AxiosAuthRefreshOptions } from '../../model';
import axios from 'axios';
import { shouldInterceptError } from '../shouldInterceptError';
import { AxiosAuthRefreshError } from '../../model';
import { createAxiosAuthRefreshErrorMock } from '../../test/axiosAuthRefreshErrorMock';

describe('Determines if the response should be intercepted', () => {
    let cache: AxiosAuthRefreshCache | undefined;

    beforeEach(() => {
        cache = {
            skipInstances: [],
            refreshCall: undefined,
            requestQueueInterceptorId: undefined,
        };
    });

    const options: AxiosAuthRefreshOptions = { statusCodes: [401] };

    it('no error object provided', () => {
        // Arrange
        const errorMock = undefined;

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('no response inside error object', () => {
        // Arrange
        const errorMock = {};

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('no status in error.response object', () => {
        // Arrange
        const errorMock = { response: {} };

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('error does not include the response status', () => {
        // Arrange
        const errorMock = { response: { status: 403 } };

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('error includes the response status', () => {
        // Arrange
        const errorMock = createAxiosAuthRefreshErrorMock({ response: { status: 401 } });

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeTruthy();
    });
    it('error has response status specified as a string', () => {
        // Arrange
        const errorMock: AxiosAuthRefreshError = createAxiosAuthRefreshErrorMock({
            response: { status: '401' as unknown as number },
        });

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeTruthy();
    });
    it('when skipAuthRefresh flag is set ot true', () => {
        // Arrange
        const errorMock = { response: { status: 401 }, config: { skipAuthRefresh: true } };

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('when skipAuthRefresh flag is set to false', () => {
        // Arrange
        const errorMock: AxiosAuthRefreshError = createAxiosAuthRefreshErrorMock({
            response: { status: 401 },
            config: { skipAuthRefresh: false },
        });

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert
        expect(result).toBeTruthy();
    });
    it('when pauseInstanceWhileRefreshing flag is not provided', () => {
        // Arrange
        const errorMock: AxiosAuthRefreshError = createAxiosAuthRefreshErrorMock({ response: { status: 401 } });

        // Act
        const result = shouldInterceptError(errorMock, options, axios, cache as any);

        // Assert

        expect(result).toBeTruthy();
    });
    it('when pauseInstanceWhileRefreshing flag is set to true', () => {
        // Arrange
        const errorMock = { response: { status: 401 } };
        const newCache = { ...cache, skipInstances: [axios] };
        const newOptions = { ...options, pauseInstanceWhileRefreshing: true };

        // Act
        const result = shouldInterceptError(errorMock, newOptions, axios, newCache as any);

        // Assert
        expect(result).toBeFalsy();
    });
    it('when pauseInstanceWhileRefreshing flag is set to false', () => {
        // Arrange
        const errorMock: AxiosAuthRefreshError = createAxiosAuthRefreshErrorMock({ response: { status: 401 } });
        const newOptions = { ...options, pauseInstanceWhileRefreshing: false };

        // Act
        const result = shouldInterceptError(errorMock, newOptions, axios, cache as any);

        // Assert
        expect(result).toBeTruthy();
    });
    it('when shouldRefresh return true', () => {
        // Arrange
        const errorMock: AxiosAuthRefreshError = createAxiosAuthRefreshErrorMock({ response: { status: 401 } });
        const newOptions: AxiosAuthRefreshOptions = { ...options, shouldRefresh: () => true };

        // Act
        const result = shouldInterceptError(errorMock, newOptions, axios, cache as any);

        // Assert
        expect(result).toBeTruthy();
    });
    it('when shouldRefresh return false', () => {
        // Arrange
        const errorMock = { response: { status: 401 } };
        const newOptions: AxiosAuthRefreshOptions = { ...options, shouldRefresh: () => false };

        // Act
        const result = shouldInterceptError(errorMock, newOptions, axios, cache as any);

        // Assert
        expect(result).toBeFalsy();
    });
});
