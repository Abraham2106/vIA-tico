---
name: local-ai
description: >
  IA local-first de ViáticoCero: comprobantes on-device, sin API cloud de visión
  ni LLM. Úsala al elegir modelos, red, privacidad, HuggingFace, OpenAI, OCR
  cloud, o cuando el usuario pida “que no salga de la máquina”.
---

# IA local (ViáticoCero)

El producto existe para que el **recibo no viaje a un API de terceros**. Inferencia = QVAC en el hardware del usuario (teléfono y/o PC de la red).

## Qué está permitido

| Dato | Dónde se procesa |
| --- | --- |
| Foto del comprobante | VisionPsy Nano **en el celular** |
| Razonamiento / política / redacción | LLM pesado **en el escritorio** |
| Expediente, PDF, Excel | Disco local del desktop |

Red: emparejamiento LAN/P2P entre **sus** dispositivos. Descarga inicial de pesos (registro QVAC / Hugging Face) es distribución de modelos, no envío de recibos.

## Qué está prohibido (salvo ADR nuevo)

- OpenAI, Anthropic, Gemini, vision APIs cloud, OCR SaaS.
- Subir la imagen o el DTO a un backend propio “temporal”.
- Correr VisionPsy en un servidor remoto de la empresa *en lugar del teléfono* (el Nano está pensado para el dispositivo).
- Telemetría de contenido de recibos.

## Diseño

1. Extrae en el borde (Nano, 1 imagen). El DTO es texto estructurado, no el JPEG, salvo que el desktop lo pida como archivo local ya transferido al inbox.
2. El LLM pesado ve el DTO (y adjuntos locales en el PC), no un POST a internet.
3. `unloadModel` cuando la pantalla ya no necesita el motor (RAM en móvil).
4. Tests de dominio con puertos mockeados: no descargues GGUF en CI unitaria.

Si una feature “necesita la nube”, para y propone un ADR. No lo cueles en un adaptador.
