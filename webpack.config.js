const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        'scripts/loadSecrets': [ 'babel-polyfill', './src/scripts/loadSecrets.js' ],
        'lambda/ping': [ 'babel-polyfill', './src/lambda/ping/index.js' ],
        'lambda/webApi': [ 'babel-polyfill', './src/lambda/webApi/index.js' ],
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: 'src/[name].js',
    },
    target: 'node',
    externals: [ nodeExternals() ],
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: __dirname,
            exclude: /node_modules/,
            query: {
                cacheDirectory: true,
                plugins: ['transform-decorators-legacy'],
                presets: ['es2017', 'stage-0']
            }
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    }
};
