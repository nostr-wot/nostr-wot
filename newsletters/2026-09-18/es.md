---
issue: "2026-09-18"
locale: "es"
status: "prepared"
subject: "Amethyst encuentra antes los comentarios anidados"
preheader: "Una corrección publicada y las versiones de referencia del 11 al 18 de septiembre."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## Una mejora publicada para descubrir respuestas

[Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), publicada el 12 de septiembre a las 14:42 UTC, ofrece descargas para Android y escritorio. Su [cambio de filtros NIP-22](https://github.com/vitorpamplona/amethyst/pull/4095) permite descubrir comentarios anidados mediante la raíz de la conversación, además de las consultas existentes para respuestas directas.

La diferencia es pequeña pero relevante: una respuesta a un comentario identifica la conversación original con una etiqueta en mayúscula, mientras que la etiqueta en minúscula apunta al padre inmediato. Buscar solo el padre omite esa respuesta anidada al consultar el elemento original. Los filtros separados por raíz corrigen la consulta. La disponibilidad de los relés y los límites temporales siguen determinando qué eventos llegan; el cambio no garantiza que se carguen todas las respuestas.

La misma versión corrige el descubrimiento de actualizaciones de solicitudes de cambio NIP-34. Nuestro [análisis del código](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) explica ambos casos. Las descargas de GitHub acreditan la distribución allí, no el estado de publicación en una tienda.

## Nuestra extensión y SDK al cierre de esta edición

Esta edición recuperada cubre del 11 de septiembre a las 08:00 UTC al 18 de septiembre a las 08:00 UTC. La [descarga 0.7.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) de la extensión, publicada el 10 de septiembre a las 22:29 UTC, sigue siendo la referencia de GitHub al cierre. Es contexto de la edición anterior. Su [registro de cambios publicado](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) describe cambios en rutas de identidad y recuperación; un ZIP descargable para Firefox no acredita disponibilidad en su tienda.

Los registros oficiales de npm de los 12 paquetes no privados del SDK no muestran versiones publicadas en este período. La referencia del [paquete principal](https://registry.npmjs.org/nostr-wot-sdk) es 1.0.1, publicada el 16 de agosto. Las versiones del 19 y 20 de septiembre corresponden a la próxima edición y quedan excluidas.

## Una comprobación útil para desarrolladores de clientes

Si una respuesta anidada aparece solo al abrir el hilo, compara los filtros de padre directo y raíz antes de atribuirlo a contenido ausente. El parche de Amethyst ofrece una implementación concreta para estudiar. Usa eventos de prueba desechables e inspecciona la consulta real al relé; una etiqueta del protocolo y su tratamiento por el cliente son cosas distintas.
