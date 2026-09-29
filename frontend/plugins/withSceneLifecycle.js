// Adopts the UIKit scene-based life cycle, which the iOS 27 SDK requires: apps built with it
// abort at launch ("UIScene life cycle is required for apps built with this SDK") otherwise.
//
// Expo ships the scene delegate (EXExpoAppSceneDelegate) but the SDK 57 project template still
// uses the app-delegate window. This plugin:
//   1. registers EXExpoAppSceneDelegate in Info.plist (UIApplicationSceneManifest), and
//   2. makes AppDelegate hand its React Native factory to the scene delegate instead of creating
//      the window itself.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_MANIFEST = {
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: 'Default Configuration',
        UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
      },
    ],
  },
};

const LEGACY_WINDOW_SETUP = /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/;

function patchAppDelegate(contents) {
  if (contents.includes('ExpoReactNativeFactoryProvider')) return contents;
  if (!/class AppDelegate: ExpoAppDelegate \{/.test(contents) || !LEGACY_WINDOW_SETUP.test(contents)) {
    throw new Error('withSceneLifecycle: AppDelegate.swift has an unexpected shape; update the plugin.');
  }
  return contents
    .replace(
      'class AppDelegate: ExpoAppDelegate {',
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
    )
    .replace(
      LEGACY_WINDOW_SETUP,
      '\n    // The window is created by EXExpoAppSceneDelegate (see UIApplicationSceneManifest in Info.plist),\n' +
        '    // which starts React Native with `reactNativeFactory`.\n',
    );
}

module.exports = function withSceneLifecycle(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = SCENE_MANIFEST;
    return cfg;
  });
  config = withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle only supports a Swift AppDelegate.');
    }
    cfg.modResults.contents = patchAppDelegate(cfg.modResults.contents);
    return cfg;
  });
  return config;
};

module.exports.patchAppDelegate = patchAppDelegate;
