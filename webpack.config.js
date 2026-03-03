const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const commonConfig = {
    devtool: 'hidden-source-map',
    entry: './src/index.ts',
    externals: ['axios'],
    resolve: {
        extensions: ['.ts'],
    },
    module: {
        rules: [{ test: /\.tsx?$/, loader: 'ts-loader' }],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
};

module.exports = [
    {
        ...commonConfig,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.min.js',
            library: {
                name: 'axios-auth-refresh',
                type: 'umd',
            },
            globalObject: 'this',
        },
        plugins: [new CleanWebpackPlugin()],
    },
    {
        ...commonConfig,
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.esm.js',
            library: {
                type: 'module',
            },
        },
        experiments: {
            outputModule: true,
        },
    },
];
