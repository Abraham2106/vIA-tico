# ADR 0008 — Handshake por DTO, no por delegated inference

## Estado

Aceptada.

## Contexto

QVAC permite `loadModel({ delegate })` para que el teléfono use el Instruct del PC por Hyperswarm. Eso entrega tokens al celular, no un expediente con veredicto en Electron.

## Decisión

El camino de producto es:

1. VisionPsy local → `packages/contracts/vision-result` (schema + confianza + RAW)
2. Envío como `analysis-job`
3. Inbox desktop → `ingest-vision-result` → postproceso opcional → **`validate-policy` en core**
4. Centro de excepciones, liquidación, `IReportExporter`

`IQvacProvider` / delegated inference queda **opcional** (el celular pide una inferencia al LLM sin pasar por la pantalla de export).

## Consecuencias

- Hay que definir transporte del DTO (P2P custom, socket local, etc.) en implementación; el puerto es `IJobTransport`.
- Pairing sigue siendo necesario (identidad del desktop).
- Cold start DHT (15–45 s) no bloquea el inbox si el job ya llegó por el canal de producto.
