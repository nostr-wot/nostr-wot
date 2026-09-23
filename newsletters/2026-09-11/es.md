---
issue: "2026-09-11"
locale: es
status: approved
subject: "Nostr WoT 0.7.0: más control sobre tus identidades"
preheader: "Rutas de identidad personalizadas, permisos más claros y seis proyectos para explorar."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## Tus identidades, con más control

La extensión Nostr WoT **0.7.0** está disponible como [descarga en GitHub](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), publicada el **10 de septiembre de 2026 a las 22:29 UTC**. La [ficha actual de Chrome](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) también muestra **0.7.0**, actualizada el **11 de septiembre**. La disponibilidad en la tienda de Firefox sigue siendo **desconocida**: tanto la ficha como su API devolvieron 404. El ZIP de Firefox en GitHub no demuestra aprobación en la tienda ni compatibilidad de instalación.

El [registro de cambios publicado](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) incluye nombres de cuenta editables, rutas de derivación personalizadas en Advanced y vistas previas de la clave pública antes de crear una subcuenta. Las claves estándar existentes no cambian. Guarda la ruta personalizada exacta junto con la copia de tu semilla: el nombre local de una cuenta no es un secreto de recuperación.

También permite restaurar copias cifradas de semillas y claves PQ, distingue mejor los permisos puntuales de los permanentes y cifra la caché del monedero. Las notas exigen Firefox de escritorio **140+** o Android **142+** y describen nuevos avisos de consentimiento al actualizar. Revisa los requisitos antes de elegir una descarga.

## Más allá de la extensión

**relayer 2.2.19**, [publicado el 8 de septiembre](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), añade una interfaz para contar la unión exacta de filtros superpuestos. El [diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) muestra un límite importante: el almacenamiento debe implementarla; los sistemas anteriores siguen sumando recuentos separados y pueden contar resultados repetidos.

El **9 de septiembre**, la [aclaración de tipos de pago de NIP-A3](https://github.com/nostr-protocol/nips/pull/2463) añadió `bitcoincash` y `tron` y aclaró el uso de esquemas URI para tipos desconocidos ambiguos. Es un cambio de especificación, no una prueba de compatibilidad en todos los clientes.

Revisamos los registros oficiales de npm de los **12 paquetes no privados del SDK**. Ninguna versión se publicó dentro del periodo de este número. El [paquete general](https://registry.npmjs.org/nostr-wot-sdk) sigue en **1.0.1**, publicado el **16 de agosto**: es contexto, no una novedad semanal.

## Seis nuevas entradas, no seis lanzamientos

Nuestro [índice de proyectos](https://nostr-wot.com/projects) incorporó **Damus, Amethyst, Primal, Coracle, Amber y Nostur** el [8 de septiembre](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7). Son proyectos existentes que ahora indexamos. Cada ficha enlaza sus fuentes y las personas o perfiles cuya atribución se ha verificado. El estado de desarrollo no es una valoración de seguridad.

## Seguridad: mejoras, no un ataque confirmado

El registro de 0.7.0 documenta controles más estrictos por cuenta y sesión y la cancelación de operaciones obsoletas al bloquear o cambiar de cuenta. Son correcciones y mejoras publicadas. Las pruebas revisadas no demuestran explotación, víctimas afectadas ni una cobertura completa de incidentes.

## Un siguiente paso útil

Lee la [guía de rutas de identidad](https://nostr-wot.com/guides/custom-identity-paths) antes de usar Advanced. Comprende cómo la semilla y la ruta exacta recuperan una identidad y por qué cambiar su nombre local no cambia su clave pública.
