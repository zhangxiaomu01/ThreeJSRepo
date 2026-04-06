const path = require('path');

module.exports = {
    entry: "./src/main.js",
    mode: "development",
    devtool: 'source-map',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist'),
        pathinfo: true,
    },
    optimization: {
        minimize: false,
        usedExports: false,
        concatenateModules: false,
    },
    module: {
        rules: [ 
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'scss-loader',
                ],
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
}
