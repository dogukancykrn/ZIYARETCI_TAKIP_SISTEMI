var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: ['babel-polyfill', './src/Scripts/Index.tsx'],
	output: {
		path: __dirname,
		filename: "./scripts/app.bundle.js"
	},
	resolve: {
		root: __dirname,
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.css']
	},
	resolveLoader: {
        root: path.join(__dirname, 'node_modules'),
        modulesDirectories: ['node_modules'],
        fallback: path.join(__dirname, "node_modules")
    },
	module: {
		loaders: [
			{
				test: /\.tsx?$/, loader: 'ts' },
			{ 
				test: /\.css$/, loader: "style-loader!css-loader" },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            }
		]
	}
};
