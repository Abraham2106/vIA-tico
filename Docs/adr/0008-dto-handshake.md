# ADR 0008 — Handshake por DTO, no por delegated inference

## Estado

Aceptada.

## Contexto

QVAC permite `loadModel({ delegate })` para que el teléfono use el LLM del PC por Hyperswarm. Eso entrega tokens al celular, no un expediente en la UI de Electron (guardar, PDF, etc.).

## Decisión

El camino de producto es:

1. VisionPsy local → `packages/contracts/vision-result`
2. Envío como `analysis-job`
3. Inbox desktop → `ingest-vision-result` → `analyze-with-llm` local
4. UI y `IReportExporter`

`IQvacProvider` / delegated inference queda **opcional** (el celular pide una inferencia al LLM sin pasar por la pantalla de export).

## Consecuencias

- Hay que definir transporte del DTO (P2P custom, socket local, etc.) en implementación; el puerto es `IJobTransport`.
- Pairing sigue siendo necesario (identidad del desktop).
- Cold start DHT (15–45 s) no bloquea el inbox si el job ya llegó por el canal de producto.
