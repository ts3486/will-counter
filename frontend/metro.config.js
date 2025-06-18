const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add specific configuration for handling Hermes and React DevTools
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true
    }
  },
  unstable_allowRequireContext: true,
  babelTransformerPath: require.resolve('react-native-svg-transformer')
};

// Ensure proper module resolution for workspace
config.resolver = {
  ...config.resolver,
  platforms: ['native', 'ios', 'android', 'web'],
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, '../node_modules')
  ],
  alias: {
    'redux': path.resolve(__dirname, '../node_modules/redux/dist/redux.legacy-esm.js'),
    '@react-native/js-polyfills': path.resolve(__dirname, '../node_modules/@react-native/js-polyfills'),
    'react-native-gesture-handler': path.resolve(__dirname, 'node_modules/react-native-gesture-handler')
  }
};

module.exports = config;