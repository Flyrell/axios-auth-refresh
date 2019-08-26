const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV,
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    output: {
        filename: 'index.min.js'
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
        minimizer: [
            new UglifyJsPlugin()
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};
