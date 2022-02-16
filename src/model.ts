import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

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
  pauseInstanceWhileRefreshing?: boolean;
  onRetry?: (requestConfig: AxiosRequestConfig) => AxiosRequestConfig;

  /**
   * @deprecated
   * This flag has been deprecated in favor of `pauseInstanceWhileRefreshing` flag.
   * Use `pauseInstanceWhileRefreshing` instead.
   */
  skipWhileRefreshing?: boolean;
}

export interface AxiosAuthRefreshCache {
  skipInstances: AxiosInstance[];
  refreshCall: Promise<any>|undefined;
  requestQueueInterceptorId: number|undefined;
}

export interface AxiosAuthRefreshRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean;
}
