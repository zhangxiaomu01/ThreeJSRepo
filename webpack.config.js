const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/main.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new BundleAnalyzerPlugin(),
    ],
}