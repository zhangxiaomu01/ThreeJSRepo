const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/main.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist'),
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
    // plugins: [
    //     new BundleAnalyzerPlugin(),
    // ],
    devServer: {
        static: {
          directory: path.join(__dirname, 'dist'),
        },
        https: true,
        compress: true,
        port: 5500,
      },
}