import type { AxiosInstance } from 'axios';
import type { AxiosAuthRefreshOptions } from '../model';

/**
 * Returns instance that's going to be used when requests are retried.
 * @param instance
 * @param options
 */
export const getRetryInstance = (instance: AxiosInstance, options: AxiosAuthRefreshOptions): AxiosInstance =>
    options.retryInstance ?? instance;
