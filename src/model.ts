import { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export interface AxiosAuthRefreshOptions {
    statusCodes?: Array<number>;
    /**
     * Determine whether to refresh, if "shouldRefresh" is configured, The "statusCodes" logic will be ignored
     * @param error AxiosError
     * @returns boolean
     */
    shouldRefresh?(error: AxiosError): boolean;
    retryInstance?: AxiosInstance;
    interceptNetworkError?: boolean;
    deduplicateRefresh?: boolean;
    onRetry?: (
        requestConfig: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

    /**
     * Maximum number of consecutive refresh attempts before giving up.
     * Prevents infinite refresh loops when the refresh call succeeds,
     * but the retried request still fails with an auth error.
     * @default 3
     */
    maxRetries?: number;
}

export interface AxiosAuthRefreshCache {
    skipInstances: AxiosInstance[];
    refreshCall: Promise<any> | undefined;
    requestQueueInterceptorId: number | undefined;
}

export interface AxiosAuthRefreshRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}
