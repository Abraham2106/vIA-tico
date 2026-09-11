# config/qvac

El worker Bare se arma con el JSON en la **raíz Expo** (`apps/mobile/qvac.config.json`), que es donde `@qvac/sdk/expo-plugin` busca `qvac.config.*` en 0.18.2.

Contenido (solo llama.cpp / VisionPsy):

```json
{ "plugins": ["@qvac/sdk/llamacpp-completion/plugin"] }
```

Sin ese archivo el prebuild empaqueta todos los addons. No uses `.ts` en móvil.
