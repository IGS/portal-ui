var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

// assets.js
var assets = require('./js/assets');

var copiers = [];

function make_spec(key, asset) {
    var spec = {};

    if (typeof asset === 'object') {
        var source = asset['source'];
        var asset_type = asset['type'];
        var dest = null;

        if (asset.hasOwnProperty('dest')) {
            dest = asset['dest'];
        } else {
            dest = path.basename(source);
        }

        spec = {
            from: path.resolve(__dirname, `./node_modules/${source}`),
            to: path.resolve(__dirname, `./${key}/components/${dest}`)
        };

        if (asset_type === 'dir') {
            spec['toType'] = 'dir';
        }
    } else {
        spec = {
            from: path.resolve(__dirname, `./node_modules/${asset}`),
            to: path.resolve(__dirname, `./${key}/components/`)
        };
    }

    return spec;
}

Object.keys(assets).forEach(function(key) {
    if (assets[key].length > 0) {

        assets[key].map(asset => {
            var spec = make_spec(key, asset);

            var copier = new CopyWebpackPlugin({
                patterns: [
                    spec
                ]
            });

            copiers.push(copier);
        });
    }
});

module.exports = {
    performance: {
        maxAssetSize: 1000000
    },
    optimization: {
        minimize: false
    },
    entry: {
        'index': __dirname + '/js/portal.js'
    },
    output: {
        path: __dirname + '/js/components/',
        filename: '[name].bundle.js'
    },
    plugins: copiers
};
