# axios-auth-refresh
Axios plugin that makes it easy to implement automatic refresh of authorization 
via axios' [interceptors](https://github.com/axios/axios#interceptors).
You can easily intercept the original request when it fails, refresh the authentication and continue the original request,
without any additional user interaction.

Size: 1.62 KiB minified, 1.16 KiB gzipped 
 

## Installation

Installing using [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/en/docs/install)

```bash
npm install axios-auth-refresh
# or
yarn add axios-auth-refresh
```

## Syntax

```typescript
createAuthRefreshInterceptor(axios: AxiosInstance, function refreshAuthLogic (error): Promise, options: Object|undefined = {});
```

#### Parameters
- `axios` - an instance of Axios used in project/call
- `refreshAuthLogic` - a Function used for refreshing authentication (**must return a promise**).
Accepts exactly one parameter, which is the `error` returned by the original call.
- `options` - object with settings for interceptor (See [available options](#available-options))


## Usage

In order to activate the interceptors, you need to import a function from `axios-auth-refresh`
which is *exported by default* and call it with the **axios instance** you want the interceptors for, 
as well as the **refresh authorization function** where you need to write the logic for refreshing the authorization.

The interceptors will then be bind onto the axios instance and logic will be ran whenever [401 (Unauthorized)](https://httpstatuses.com/401) status code 
is returned from a server (or any other status code you provide in options). All new requests created while the refreshAuthLogic is processed will be bind onto the 
Promise returned from the refreshAuthLogic function.

```javascript
import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

// Function that will be called to refresh authorization
const refreshAuthLogic = err => axios.post('https://www.example.com/auth/token/refresh').then(res => {
    localStorage.setItem('token', res.data.token);
    err.response.config.headers['Authentication'] = 'Bearer ' + res.data.token;
    return Promise.resolve();
});

// Instantiate the interceptor (you can chain it as it returns the axios instance)
createAuthRefreshInterceptor(axios, refreshAuthLogic);

// Make a call
axios.get('https://www.example.com/restricted/area')
    .then(/* ... */)
    .catch(/* ... */);
```

## Available options

#### Status codes to intercept

You can specify multiple status codes that you want the interceptor to run for.

```javascript
{
    statusCodes: [ 401, 403 ] // default: [ 401 ]
}
```

