import type { AxiosInstance, AxiosResponse } from 'axios';
import { isAxiosAuthRefreshError } from './isAxiosAuthRefreshError';

/**
 * Resend failed axios request.
 * @param error
 * @param instance
 */
export const resendFailedRequest = async (
    error: unknown,
    instance: AxiosInstance
): Promise<AxiosResponse | undefined> => {
    if (!isAxiosAuthRefreshError(error) || !error.response?.config) return undefined;

    error.config.skipAuthRefresh = true;
    return instance(error.response.config);
};
