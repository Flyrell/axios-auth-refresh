/** @type {Object} */
const defaults = {

    /** @type {Number[]} */
    statusCodes: [
        401 // Unauthorized
    ]
};

const _refreshCall = null;

/**
 * Creates an authentication refresh interceptor that binds to any error response.
 * If the response code is 401, interceptor tries to call the refreshTokenCall which must return a Promise.
 * While refreshTokenCall is running, all new requests are intercepted and waiting for it to resolve.
 * After Promise is resolved/rejected the authentication refresh interceptor is revoked.
 * @param {AxiosInstance|Function} axios - axios instance
 * @param {Function} refreshTokenCall - refresh token call which must return a Promise
 * @param {Object} options - options for the interceptor @see defaultOptions
 * @return {AxiosInstance}
 */
function createAuthRefreshInterceptor (axios, refreshTokenCall, options = {}) {
    const id = axios.interceptors.response.use(res => res, error => {

        // Reject promise if the error status is not in options.ports or defaults.ports
        const statusCodes = options.hasOwnProperty('statusCodes') && options.statusCodes.length
            ? options.statusCodes
            : defaults.statusCodes;
        if (!error.response || (error.response.status && statusCodes.indexOf(+error.response.status) === -1)) {
            return Promise.reject(error);
        }

        // Remove the interceptor to prevent a loop
        // in case token refresh also causes the 401
        axios.interceptors.response.eject(id);

        const refreshCall = _refreshCall ? _refreshCall : refreshTokenCall(error);

        // Create interceptor that will bind all the others requests
        // until refreshTokenCall is resolved
        const requestQueueInterceptorId = axios.interceptors
            .request
            .use(request => refreshCall.then(() => request));

        // When response code is 401 (Unauthorized), try to refresh the token.
        return refreshCall.then(() => {
            axios.interceptors.request.eject(requestQueueInterceptorId);
            return axios(error.response.config);
        }).catch(error => {
            axios.interceptors.request.eject(requestQueueInterceptorId);
            return Promise.reject(error)
        }).finally(() => {
            _refreshCall = null;
            createAuthRefreshInterceptor(axios, refreshTokenCall, options)
        });
    });
    return axios;
}
export default createAuthRefreshInterceptor;
