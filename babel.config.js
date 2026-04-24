module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // NOTE: Keep Reanimated plugin last.
      'react-native-reanimated/plugin',
    ],
  };
};
