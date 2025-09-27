module.exports = {
  owner: "ts3486",
  expo: {
    name: "will-counter",
    slug: "will-counter",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#E6F8D9"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.taoshimomura.willcounter",
      infoPlist: {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    extra: {
      eas: {
        projectId: "5b31fd7e-5f2b-4d59-9044-d0b29823538e"
      }
    },
    scheme: "willcounter",
    experiments: {
      tsconfigPaths: true
    },
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            newArchEnabled: false
          }
        }
      ]
    ],
    jsEngine: "jsc"
  }
}; 