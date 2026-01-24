const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add wasm to both asset and source extensions
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

// Add headers to the dev server for SharedArrayBuffer support
config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
