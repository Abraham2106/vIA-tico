# Stack de ViáticoCero

Versiones y runtime **fijados en este scaffold**. No se mezcla un segundo motor de inferencia ni un segundo empaquetador.

## Matriz

| Capa | Elección | Versión / nota |
| --- | --- | --- |
| Lenguaje | TypeScript | Todo el hexágono y los adaptadores |
| Inferencia local | Tether **QVAC** JS/TS SDK | **`@qvac/sdk@0.18.2`** |
| Motor in-process Bare | `@qvac/inference` | Misma línea **0.18.2** (`@qvac/bare-sdk` está deprecado; 0.18.2 es su último release) |
| Modelo de visión | **VisionPsy Nano** (familia PSY de Tether) | Constantes multimodales del SDK 0.18.x |
| Worker | **Bare** | El SDK empaqueta un worker Bare; `asar: false` es obligatorio |
| Escritorio | Electron | Main carga QVAC; renderer **no** importa el SDK |
| UI | React + Vite vía **electron-vite** | Scaffold oficial QVAC: `@quick-start/electron` template `react-ts` |
| Empaquetado | Electron Forge + `QvacForgePlugin` | `@qvac/sdk/electron-forge` |
| Host Node | Node.js **≥ 22.17**, npm **≥ 10.9** | Requisito del SDK, no de este repo |

`18.2` en este proyecto **es QVAC SDK 0.18.2**, no React 18.2. El tutorial de Electron de QVAC no pinnea React; la UI seguirá la versión que traiga el template `react-ts` de electron-vite.

## Por qué este stack (y no otro)

1. **QVAC 0.18.2** es la línea que publica las constantes VisionPsy Nano (`VISIONPSY_NANO_460M_MULTIMODAL_*` + `MMPROJ_VISIONPSY_NANO_460M_MULTIMODAL_*`) y el plugin de Electron Forge. Pinnear 0.18.2 evita deriva silenciosa de addons nativos.
2. **VisionPsy** es el VLM de Tether para una imagen por consulta (recibo, ticket, captura). Encaja el caso de viáticos: un adjunto, extraer monto / fecha / merchant, no un chat genérico.
3. **Bare** es el runtime real del worker QVAC. En Electron el SDK spawnea ese worker; en un entry Bare in-process se usa `@qvac/inference` con registro explícito de plugins. El scaffold reserva **las dos** raíces de composición (`src/composition/electron` y `src/composition/bare`).
4. **Electron + React + Vite** es el camino documentado por Tether (`npm create @quick-start/electron@latest -- --template react-ts`), no un invento paralelo. Conservamos `src/main`, `src/preload`, `src/renderer` para no pelear con electron-vite.
5. **TypeScript** es el cliente de primer nivel del SDK (`@qvac/sdk` tipado) y el contrato de los puertos hexagonales.

## Qué queda fuera (a propósito)

- Expo / React Native (QVAC lo soporta; ViáticoCero arranca escritorio).
- Python `tetherto-qvac-sdk` (mismo worker, otro cliente).
- Wrappers sobre `@qvac/sdk`: el adaptador llama al SDK **directo**. Subir de 0.18.2 debe ser un bump de `package.json`, no un shim.
- OCR aparte (`@qvac/sdk/ggml-ocr/plugin`): VisionPsy ya cubre documento + imagen. El plugin OCR se puede añadir después sin tocar el dominio.

## Plugin QVAC que este producto necesita

VisionPsy se carga como LLM multimodal llama.cpp. En `qvac.config.json` (cuando exista) el bundle debe listar **solo**:

```json
{
  "plugins": ["@qvac/sdk/llamacpp-completion/plugin"]
}
```

En Bare in-process el equivalente es registrar `llmPlugin` desde `@qvac/inference/llamacpp-completion/plugin` **antes** de la primera llamada.
