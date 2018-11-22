const path = require('path');

module.exports = {
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    entry: './src/index.js',
    output: {
        filename: 'index.min.js',
        path: path.resolve(__dirname, 'dist')
    }
};
