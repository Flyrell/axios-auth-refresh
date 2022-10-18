import type { AxiosAuthRefreshOptions } from './model';

export const defaultOptions: AxiosAuthRefreshOptions = {
    statusCodes: [401],
    pauseInstanceWhileRefreshing: false,
};
