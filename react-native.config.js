// react-native.config.js
module.exports = {
  dependencies: {
    '@react-native-firebase/app': {
      platforms: {
        ios: null, // 🔴 wyłącza natywny pod dla iOS
      },
    },
    '@react-native-firebase/messaging': {
      platforms: {
        ios: null, // 🔴 wyłącza natywny pod dla iOS
      },
    },
  },
};
