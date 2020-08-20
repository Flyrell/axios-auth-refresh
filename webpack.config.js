const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    externals: [ 'axios' ],
    output: {
        filename: 'index.min.js',
        library: 'axios-auth-refresh',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, exclude: "/node-modules/", loader: "ts-loader" }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ sourceMap: false })],
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};
