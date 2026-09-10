# ADR 0004 — VisionPsy Nano como único VLM

## Estado

Aceptada.

## Contexto

ViáticoCero necesita leer comprobantes en el dispositivo. Tether publica VisionPsy Nano (460M) para una imagen por consulta, con pares Flash/Base en el SDK 0.18.x.

## Decisión

- Default: **Flash** (`VISIONPSY_NANO_460M_MULTIMODAL_Q8_0` + mmproj homónimo + `image_no_upscale: 'on'`).
- Perfil opcional: Base (`*_1`, sin el flag).
- Plugin bundle: solo `llamacpp-completion`.
- El dominio no nombra GGUF ni mmproj.

## Consecuencias

- Calidad de OCR/inglés limitada; el adaptador debe validar salida.
- Multi-imagen queda fuera de alcance (el modelo no está entrenado para eso).
- No se añade `ggml-ocr` en el scaffold.
