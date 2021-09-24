const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    devtool: "hidden-source-map",
    entry: "./src/index.ts",
    externals: [ 'axios' ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.min.js',
        library: {
            name: 'axios-auth-refresh',
            type: 'umd'
        },
        globalObject: 'this'
    },
    resolve: {
        extensions: [".ts"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};
