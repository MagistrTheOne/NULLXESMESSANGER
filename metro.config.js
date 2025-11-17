const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
 
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');
config.resolver.unstable_enablePackageExports = true;

// Fix for web platform - disable import.meta usage
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Fix for tslib and framer-motion ESM modules
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Skip ZEGO SDK on web platform
  if (platform === 'web' && moduleName === 'zego-express-engine-reactnative') {
    return {
      type: 'empty',
    };
  }
  
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

