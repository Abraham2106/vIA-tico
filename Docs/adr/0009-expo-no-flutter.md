# ADR 0009 — Android es Expo / React Native, no Flutter

## Estado

Aceptada.

## Contexto

Hace falta una app en el celular para VisionPsy Nano. Candidatos habituales: Flutter, Kotlin nativo, Expo/React Native.

QVAC JS/TS en móvil está documentado **solo** vía Expo ≥ 54 + `react-native-bare-kit` + `@qvac/sdk/expo-plugin`. No hay cliente Flutter ni un camino soportado de addons Bare en Dart.

## Decisión

- `apps/mobile` = **Expo + React Native + TypeScript + QVAC**.
- **No Flutter.** No se añade carpeta `apps/mobile_flutter` ni dependencias Dart.
- **No** app Kotlin/Jetpack como producto. Android Studio / `adb` / SDK = toolchain (`npx expo run:android --device`).
- UI móvil ≠ UI Electron: no se comparten widgets Flutter ni `Widget`/`View` con el renderer.

## Por qué

VisionPsy y el worker Bare en el teléfono dependen de esos addons nativos. Flutter partiría el lenguaje del hexágono (`packages/core` es TS) y dejaría el Nano fuera del SDK oficial.

## Consecuencias

- Dev: development build, dispositivo **físico**, no Expo Go, no emulador.
- Un agente que proponga Flutter debe parar y señalar este ADR.
