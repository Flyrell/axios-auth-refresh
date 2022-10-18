import type { AxiosAuthRefreshOptions } from '../model';

/**
 * Merges two options objects (options overwrites defaults).
 * @param defaults
 * @param options
 */
export const mergeOptions = (
    defaults: AxiosAuthRefreshOptions,
    options: AxiosAuthRefreshOptions
): AxiosAuthRefreshOptions => ({ ...defaults, pauseInstanceWhileRefreshing: options.skipWhileRefreshing, ...options });
