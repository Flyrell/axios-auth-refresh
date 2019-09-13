import { AxiosInstance } from "axios";
import { AxiosAuthRefreshOptions } from "./types";
/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {AxiosInstance} axios - axios instance
 * @param {(error: any) => Promise<AxiosPromise>} refreshTokenCall - refresh token call which must return a Promise
 * @param {AxiosAuthRefreshOptions} options - options for the interceptor @see defaultOptions
 * @return {AxiosInstance}
 */
declare function createAuthRefreshInterceptor(axios: AxiosInstance, refreshTokenCall: (error: any) => Promise<any>, options?: AxiosAuthRefreshOptions): AxiosInstance;
export default createAuthRefreshInterceptor;
