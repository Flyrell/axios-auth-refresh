# axios-auth-refresh
Axios plugin that makes it easy to implement automatic refresh of authorization 
via axios' [interceptors](https://github.com/axios/axios#interceptors). 

Size: 1.25 KiB minified, 1.02 KiB gzipped 
 

## Installation

Installing using [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/en/docs/install)

```bash
npm install axios-auth-refresh
# or
yarn add axios-auth-refresh
```

## Syntax

```javascript
createAuthRefreshInterceptor(axios, function refreshAuthLogic () {
    // Return a Promise
});
```

#### Parameters
- `axios` - an instance of Axios used in project/call
- `refreshAuthLogic` - a Function used for refreshing authentication

## Usage

```javascript
import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

// Function that will be called to refresh authentication
function refreshAuth () {
    return axios.post('https://www.example.com/auth/token/refresh').then(res => {
        localStorage.setItem('token', res.data.token);
        return Promise.resolve();
    });
}

// Instantiate the interceptor (you can chain it as it returns the axios instance)
createAuthRefreshInterceptor(axios, refreshAuth);

// Make a call
axios.get('https://www.example.com/restricted/area')
    .then(/* ... */)
    .catch(/* ... */);
```

