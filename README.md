# axios-auth-refresh
Axios plugin that makes it easy to implement automatic refresh of authorization tokens
via axios' [interceptors](https://github.com/axios/axios#interceptors).
You can easily intercept the original request when it fails, refresh the authentication token and continue the original request,
without any additional user interaction.

The plugin stalls additional requests that have come in while waiting for a new authorization token, and resolves them when a new token is available.

Size: 2.32 KiB minified, 1.16 KiB gzipped 
 

## Installation

Using [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/en/docs/install):

```bash
npm install axios-auth-refresh
# or
yarn add axios-auth-refresh
```

## Syntax

```typescript
createAuthRefreshInterceptor(axios: AxiosInstance, function refreshAuthLogic (failedRequest): Promise, options: Object|undefined = {});
```

#### Parameters
- `axios` - an instance of Axios used in project/call
- `refreshAuthLogic` - a Function used for refreshing authentication (**must return a promise**).
Accepts exactly one parameter, which is the `failedRequest` returned by the original call.
- `options` - object with settings for interceptor (See [available options](#available-options))


## Usage

In order to activate the interceptors, you need to import a function from `axios-auth-refresh`
which is *exported by default* and call it with the **axios instance** you want the interceptors for, 
as well as the **refresh authorization function** where you need to write the logic for refreshing the authorization.

The interceptors will then be bound onto the axios instance and logic will be run whenever a [401 (Unauthorized)](https://httpstatuses.com/401) status code 
is returned from a server (or any other status code you provide in options). All new requests created while the refreshAuthLogic is processing will be bound onto the 
Promise returned from the refreshAuthLogic function. This means that the requests will be resolved when a new access token has been fetched.

```javascript
import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

// Function that will be called to refresh authorization
const refreshAuthLogic = failedRequest => axios.post('https://www.example.com/auth/token/refresh').then(tokenRefreshResponse => {
    localStorage.setItem('token', tokenRefreshResponse.data.token);
    failedRequest.response.config.headers['Authentication'] = 'Bearer ' + tokenRefreshResponse.data.token;
    return Promise.resolve();
});

// Instantiate the interceptor (you can chain it as it returns the axios instance)
createAuthRefreshInterceptor(axios, refreshAuthLogic);

// Make a call. If it returns a 401 error, the refreshAuthLogic will be run, 
// and the request retried with the new token
axios.get('https://www.example.com/restricted/area')
    .then(/* ... */)
    .catch(/* ... */);
```

#### Request interceptor
Since this plugin automatically stalls additional requests while refreshing the token, it is a good idea to **wrap your token logic interceptor in a function**, 
to make sure the stalled requests are using the newly fetched token.
```javascript
function getAccessToken(){
    return localStorage.getItem('token');
}

axios.interceptors.request.use(request => {
    request.headers['Authorization'] = getAccessToken();
    return request;
});
```

## Available options

#### Status codes to intercept

You can specify multiple status codes that you want the interceptor to run for.

```javascript
{
    statusCodes: [ 401, 403 ] // default: [ 401 ]
}
```

