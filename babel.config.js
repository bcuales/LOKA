module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo', 'nativewind/babel'],
        plugins: [
            // NOTE: Keep Reanimated plugin last.
            'react-native-reanimated/plugin',
        ],
    };
};
