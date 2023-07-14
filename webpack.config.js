const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	webpack.init(env);

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	// DHK: merge a config to ignore old webpack 4 modules
	webpack.mergeWebpack({
		resolve: {
			fallback: {
				"child_process": false,
				"fs": false,
				"tls": false,
				"net": false,

				// Node core modules
				"assert": require.resolve('assert/'),
				"buffer": require.resolve('buffer/'),
				"console": require.resolve('console-browserify'),
				"constants": require.resolve('constants-browserify'),
				"crypto": require.resolve('crypto-browserify'),
				"domain": require.resolve('domain-browser'),
				"events": require.resolve('events/'),
				"http": require.resolve('stream-http'),
				"https": require.resolve('https-browserify'),
				"os": require.resolve('os-browserify/browser'),
				"path": require.resolve('path-browserify'),
				"punycode": require.resolve('punycode/'),
				"process": require.resolve('process/browser'),
				"querystring": require.resolve('querystring-es3'),
				"stream": require.resolve('stream-browserify'),
				"_stream_duplex": require.resolve('readable-stream/lib/_stream_duplex'),
				"_stream_passthrough": require.resolve('readable-stream/lib/_stream_passthrough'),
				"_stream_readable": require.resolve('readable-stream/lib/_stream_readable'),
				"_stream_transform": require.resolve('readable-stream/lib/_stream_transform'),
				"_stream_writable": require.resolve('readable-stream/lib/_stream_writable'),
				"string_decoder": require.resolve('string_decoder/'),
				"sys": require.resolve('util/'),
				"timers": require.resolve('timers-browserify'),
				"tty": require.resolve('tty-browserify'),
				"url": require.resolve('url/'),
				"util": require.resolve('util/'),
				"vm": require.resolve('vm-browserify'),
				"zlib": require.resolve('browserify-zlib')
			},
		}
	});

	return webpack.resolveConfig();
};
