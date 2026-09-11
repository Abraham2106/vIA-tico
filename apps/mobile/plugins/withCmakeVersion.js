const { withAppBuildGradle } = require('@expo/config-plugins');

/** NDK 29 ships Clang 21; CMake 3.22 cannot detect that ABI on Windows. */
function withCmakeVersion(config) {
  return withAppBuildGradle(config, (mod) => {
    const gradle = mod.modResults.contents;
    if (gradle.includes('version "3.31.6"')) {
      return mod;
    }
    if (!gradle.includes('ndkVersion rootProject.ext.ndkVersion')) {
      throw new Error('withCmakeVersion: ndkVersion line not found in app/build.gradle');
    }
    mod.modResults.contents = gradle.replace(
      'ndkVersion rootProject.ext.ndkVersion',
      `ndkVersion rootProject.ext.ndkVersion

    externalNativeBuild {
        cmake {
            version "3.31.6"
        }
    }`
    );
    return mod;
  });
}

module.exports = withCmakeVersion;
