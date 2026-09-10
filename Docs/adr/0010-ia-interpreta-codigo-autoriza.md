# ADR 0010 — La IA interpreta; el código autoriza

## Estado

Aceptada.

## Contexto

El scaffold original presentaba ViáticoCero como «leer un recibo con VisionPsy y mostrar/exportar el análisis». La tesis es más amplia: **excepciones documentales financieras** (la IA no autoriza; el código veredicta; el humano ve ⚠). La cuña es un viaje.

## Decisión

- VisionPsy y el LLM producen **hechos candidatos** (JSON + confianza), nunca un asiento ni un pago.
- `packages/core` emite el único veredicto: `PROCEDE | REVISIÓN | NO PROCEDE`.
- Confianza baja, schema inválido, dígitos alterados, fecha fuera del viaje o duplicado → no hay atajo a PROCEDE.
- El RAW de visión se conserva. El postproceso lingüístico no puede cambiar montos, fechas ni moneda.
- No hay tools de autorización expuestas al modelo.

Test permanente: si quitar QVAC (o sustituirlo por cloud/reglas solas) deja el mismo valor, la integración está mal. QVAC existe porque el documento no sale de la máquina **y** hace falta comprensión documental/semántica.

## Consecuencias

- El desktop no es un visor del chat del LLM: es **centro de excepciones** (hoy: liquidación de viaje).
- Evals de dominio sobre veredictos, no sobre «el modelo escribió algo plausible».
- Supersede la lectura de producto de Docs pre-0010 («el PC razona y enseña el resultado» como fin).
