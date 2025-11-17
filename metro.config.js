const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
 
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');
config.resolver.unstable_enablePackageExports = true;

// Fix for tslib and framer-motion ESM modules
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    // Use the CommonJS version of tslib
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  // Use default resolver for other modules
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};
 
module.exports = withNativeWind(config, { input: './global.css' });

