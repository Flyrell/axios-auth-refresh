/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {Axios|Function|Object} axios - axios instance
 * @param {Function} refreshTokenCall - refresh token call which must return a Promise
 * @return {Axios}
 */
function createAuthRefreshInterceptor (axios, refreshTokenCall, retryCondition) {
    const id = axios.interceptors.response.use(res => res, error => {

        // Reject promise if the error status is not 401 (Unauthorized)
        if (error.response && error.response.status !== 401) {
            return Promise.reject(error);
        }

        // Reject promise if the custom condition is not satisfied (default: always retry)
        const retry = typeof retryCondition === 'function' 
            ? retryCondition(error) : 
            true;
        if (!retry) {
            return Promise.reject(error);
        }

        // Remove the interceptor to prevent a loop
        // in case token refresh also causes the 401
        axios.interceptors.response.eject(id);

        const refreshCall = refreshTokenCall();

        // Create interceptor that will bind all the others requests
        // until refreshTokenCall is resolved
        const requestQueueInterceptorId = axios.interceptors
            .request
            .use(request => refreshCall.then(() => request));

        // When response code is 401 (Unauthorized), try to refresh the token.
        return refreshCall
            .then(() => {
                axios.interceptors.request.eject(requestQueueInterceptorId);
                return axios(error.response.config);
            })
            .catch(error => {
                axios.interceptors.request.eject(requestQueueInterceptorId);
                return Promise.reject(error)
            })
            .finally(() => createAuthRefreshInterceptor(axios, refreshTokenCall));
    });
    return axios;
}
export default createAuthRefreshInterceptor;
