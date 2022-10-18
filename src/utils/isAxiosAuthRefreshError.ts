import type { AxiosAuthRefreshError } from '../model';

/**
 * A custom type guard function that determines whether `error` is an AxiosAuthRefreshError.
 * @param error
 */
export const isAxiosAuthRefreshError = (error: unknown): error is AxiosAuthRefreshError =>
    typeof error === 'object' && error !== null && 'config' in error;
// && 'isAxiosError' in error;
