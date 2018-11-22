/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * After Promise is resolved/rejected the interceptor is revoked.
 * @param {Axios|Function|Object} axios - axios instance
 * @param {Function} refreshTokenCall - refresh token call which must return a Promise
 * @return {Axios}
 */
function createAuthRefreshInterceptor (axios, refreshTokenCall) {
    const id = axios.interceptors.response.use(response => response, error => {

        // Reject promise if the error status is not 401 (Unauthorized)
        if (error.response && error.response.status !== 401) return Promise.reject(error);

        /*
         * When response code is 401 (Unauthorized), try to refresh the token.
         * Eject the interceptor so it doesn't loop in case token refresh causes the 401 response too.
         */
        axios.interceptors.response.eject(id);
        return refreshTokenCall()
            .then(() => axios(error.response.config))
            .catch(error => Promise.reject(error))
            .finally(() => createAuthRefreshInterceptor(axios, refreshTokenCall));
    });
    return axios;
}
export default createAuthRefreshInterceptor;
