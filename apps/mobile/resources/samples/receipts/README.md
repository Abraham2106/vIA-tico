# Golden set (ADR 0012)

Fixtures de dominio (sin JPEG reales en este PR):

| Caso | Resultado esperado |
| --- | --- |
| Ticket 10–14 sep, nítido | PROCEDE |
| Almuerzo 25 sep (fuera de período) | REVISIÓN / FECHA_FUERA_PERIODO |
| Mismo soda + fecha + monto | REVISIÓN / DUPLICADO |
| Confianza baja / RAW vacío | REVISIÓN |
| Hospedaje sobre tope | NO_PROCEDE |

Los evals de veredicto viven en `tests/unit`. Las fotos + VisionPsy en device físico quedan para el PR de QVAC.
