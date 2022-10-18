There are some changes in this pull request. I am aware that not all of them are desired. Accordingly, I am happy to adapt the desired proposals or to create cherry-pick pull requests for individual changes.

I think especially the point `More strict types` is to be considered here, because I have changed some `any` types to `unknown`. To work with this better, I export the custom type guard function `isAxiosAuthRefreshError`.

-   Migrated to Yarn
-   Updated several dependencies like `jest`
-   Splitted tests into multiple files for better maintenance
-   More strict TypeScript compiler config
-   Initial ESLint setup
-   More strict types (There is only one `any` remaining in the production file)
-   Removed deprecated `skipWhileRefreshing` flag
-   Migrated from `webpack` to `rollup`
