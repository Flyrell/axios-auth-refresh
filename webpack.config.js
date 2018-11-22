const path = require('path');

module.exports = {
    mode: 'production',
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    entry: './src/index.js',
    output: {
        library: 'axios-auth-refresh',
        libraryTarget: 'commonjs-module',
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'dist')
    }
};
