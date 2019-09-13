import { AxiosAuthRefreshCache, AxiosAuthRefreshOptions } from "./types";
import { AxiosInstance } from "axios";
/**
 * Merges two config objects (master rewrites slave)
 * @param {AxiosAuthRefreshOptions} master
 * @param {AxiosAuthRefreshOptions} def
 * @return {AxiosAuthRefreshOptions}
 */
export declare function mergeConfigs(master: AxiosAuthRefreshOptions, def: AxiosAuthRefreshOptions): AxiosAuthRefreshOptions;
/**
 * Returns TRUE: when error.response.status is contained in options.statusCodes
 * Returns FALSE: when error or error.response doesn't exist or options.statusCodes doesn't include response status
 * @param {any} error
 * @param {AxiosAuthRefreshOptions} options
 * @return {boolean}
 */
export declare function shouldInterceptError(error: any, options: AxiosAuthRefreshOptions): boolean;
/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {any} error
 * @param {(error: any) => Promise<any>} fn
 * @param {AxiosAuthRefreshCache} cache
 * @return {Promise<any>}
 */
export declare function createRefreshCall(error: any, fn: (error: any) => Promise<any>, cache: AxiosAuthRefreshCache): Promise<any>;
/**
 * Creates refresh call if it does not exist or returns the existing one
 * @param {AxiosInstance} axios
 * @param {AxiosAuthRefreshCache} cache
 * @return {number}
 */
export declare function createRequestQueueInterceptor(axios: AxiosInstance, cache: AxiosAuthRefreshCache): number;
