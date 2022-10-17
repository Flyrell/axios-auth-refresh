import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export interface AxiosAuthRefreshOptions {
    statusCodes?: Array<number>;
    /**
     * Determine whether to refresh, if "shouldRefresh" is configured, The "statusCodes" logic will be ignored
     * @param error
     */
    shouldRefresh?: (error: AxiosError) => boolean;
    retryInstance?: AxiosInstance;
    interceptNetworkError?: boolean;
    pauseInstanceWhileRefreshing?: boolean;
    onRetry?: (requestConfig: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
    /**
     * This flag has been deprecated in favor of `pauseInstanceWhileRefreshing` flag.
     * Use `pauseInstanceWhileRefreshing` instead.
     * @deprecated
     */
    skipWhileRefreshing?: boolean;
}

export interface AxiosAuthRefreshCache {
    skipInstances: Array<AxiosInstance>;
    refreshCall: Promise<void> | undefined;
    requestQueueInterceptorId: number | undefined;
}

export interface AxiosAuthRefreshRequestConfig extends AxiosRequestConfig {
    skipAuthRefresh?: boolean;
}

export interface AxiosAuthRefreshError extends AxiosError {
    config: AxiosAuthRefreshRequestConfig;
}
