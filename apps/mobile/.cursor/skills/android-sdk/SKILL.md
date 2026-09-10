---
name: android-sdk
description: >
  Android para ViáticoCero: Expo 54, device físico, minSdk 29, adb, VisionPsy
  on-device, no Flutter, no Kotlin como app. Úsala al editar apps/mobile,
  permisos, cámara, prebuild, Gradle, emulador, Flutter o “stack Android”.
---

# Android / Expo (apps/mobile)

La app de producto en el teléfono es **Expo + React Native + QVAC**. **No Flutter.** No Kotlin/Jetpack como app. Android Studio / `adb` / SDK son **toolchain**.

## Requisitos QVAC

- Expo **≥ 54**, `react-native-bare-kit`, `@qvac/sdk/expo-plugin`.
- `expo-build-properties`: `android.minSdkVersion` **29** (QVAC pide Android 12+ arm64).
- **Dispositivo físico.** llama.cpp no corre en emulador.
- **No Expo Go** (addons C++). Siempre `npx expo run:android --device`.
- GPU: Vulkan / OpenCL Adreno 700+; si no, CPU (más lento, válido).

## Qué vive aquí

- Expo Router: `apps/mobile/app/{capture,preview,pairing}`.
- Adaptadores: `qvac-visionpsy`, `camera`, `filesystem`.
- Composition: `src/composition/expo`.
- Worker: `apps/mobile/qvac/` + `config/qvac`.

Captura → archivo en disco → VisionPsy → DTO → transporte. **No** PDF, **no** LLM pesado, **no** liquidación completa.

## Permisos / cámara

- Cámara + (si aplica) lectura de archivos para el JPEG.
- El VLM exige `attachments[].path` real, no un blob del ImagePicker sin persistir.

## Qué no hagas

- **Flutter** (`pubspec.yaml`, `Widget`, un segundo `apps/mobile` en Dart). ADR 0009. QVAC no tiene SDK Flutter.
- Nueva Activity Java “porque es Android”.
- Probar QVAC en AVD.
- Meter `electron` o `react-dom` en este paquete.
- Bajar el LLM de escritorio al teléfono “por si no hay PC”.

Docs: [Expo tutorial](https://docs.qvac.tether.io/tutorials/expo/), [system requirements](https://docs.qvac.tether.io/system-requirements/).
