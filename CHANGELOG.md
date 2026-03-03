# Changelog

## v5.0.0

### Breaking Changes

- **Peer dependency raised to `axios >= 1.0.0`** — The library uses `InternalAxiosRequestConfig` and `axios.CanceledError`, both of which only exist in axios v1+. The previous peer range (`>= 0.18`) allowed versions that would fail at runtime.

- **`parseInt` removed from status code comparison** — `error.response.status` is no longer coerced via `parseInt()`. Axios always returns status codes as numbers, so this should not affect normal usage. However, if you have a custom adapter or interceptor that sets status as a string (e.g., `"401"`), it will no longer match `statusCodes: [401]`. Use the `shouldRefresh` callback for custom matching logic.

- **Options are now merged once at setup time** — Previously, options were re-merged on every intercepted error, meaning mutations to the original `options` object after calling `createAuthRefreshInterceptor()` would be picked up. Options are now frozen at setup time. If you need to change options, eject the interceptor and create a new one.

- **Default `maxRetries: 3` prevents infinite refresh loops** — A new `maxRetries` option (default: `3`) limits how many times a single request can trigger the refresh flow. If a retried request keeps failing with an auth error after 3 refresh cycles, it will be rejected instead of looping forever. Set `maxRetries` to a higher value if your use case requires it.

- **`axios.Cancel` replaced with `axios.CanceledError`** — Queued requests that fail because the refresh call failed now throw `axios.CanceledError` instead of the deprecated `axios.Cancel`. `axios.isCancel()` still returns `true` for these errors, so most code is unaffected. Only breaks if you were doing `error instanceof axios.Cancel` directly.

### Bug Fixes

- **`mergeOptions` no longer overrides `pauseInstanceWhileRefreshing` with `undefined`** — When `skipWhileRefreshing` was not provided, the old code would set `pauseInstanceWhileRefreshing` to `undefined` before spreading user options, losing the default `false` value.

- **`resendFailedRequest` now uses `error.config` consistently** — Previously it set `skipAuthRefresh` on `error.config` but sent `error.response.config`. These happen to be the same reference in most cases, but the code now uses `error.config` for both operations.

- **Duplicate `skipInstances` push guarded** — When multiple errors arrived before a refresh completed, the same instance could be pushed into `skipInstances` multiple times. Now guarded with an `includes()` check.

### Improvements

- **`shouldRefresh` callback errors are caught** — If the user-provided `shouldRefresh` function throws, the error is now caught and logged, and the interceptor skips the refresh (returns `false`) instead of propagating an unhandled rejection.

- **`onRetry` callback errors are caught** — If the synchronous part of `onRetry` throws, the error is caught and logged, and the original request config is used as a fallback.

- **ESM build output** — The package now ships both UMD (`dist/index.min.js`) and ESM (`dist/index.esm.js`) bundles. The `package.json` includes `module` and `exports` fields for modern bundlers and Node.js ESM support.

- **External HTTP calls removed from tests** — Tests no longer hit `httpstat.us`. All HTTP interactions are mocked via custom axios adapters, making tests reliable and CI-independent.

### New Options

- **`maxRetries`** (`number`, default: `3`) — Maximum number of consecutive refresh attempts for a single request before giving up.

---

## v4.0.1

### Bug Fixes

- Fixed npm publishing configuration.

---

## v4.0.0

### Breaking Changes

- **Requires axios v1+** — Types updated from `AxiosRequestConfig` to `InternalAxiosRequestConfig` throughout. The `onRetry` callback now receives and returns `InternalAxiosRequestConfig` instead of `AxiosRequestConfig`.

- **Updated all dev dependencies** — TypeScript 5.8, Jest 29, Webpack 5.105, Prettier 3.8, Husky 9. No changes to runtime behavior, but the build toolchain is modernized.
