---
issue: "2026-10-16"
locale: "es"
status: "prepared"
subject: "SDK 2.0.0 publicado, Amethyst añade herramientas de confianza"
preheader: "Versiones verificadas del SDK, escritorio, firmante y Web of Trust del 9 al 16 de octubre."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 está publicado en npm

El registro de npm muestra [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) el 12 de octubre a las 22:32 UTC. El paquete publicado apunta al commit `2937df1`, incluye un valor de integridad del registro y cambia el código propio del proyecto de MIT a GPL-3.0-only. Las versiones publicadas anteriormente conservan su licencia original. El [registro de cambios publicado](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) enumera versiones mayores correspondientes de los paquetes con alcance de autenticación, Blossom, datos, mensajes directos, grafo, relés, firmantes, interfaz, cartera y WoT.

Esta es una versión de licencia, no una prueba de una nueva función en ejecución. Antes de actualizar, los desarrolladores deberían revisar la compatibilidad de la licencia, fijar el valor de integridad del registro y probar el conjunto exacto de paquetes que instala su aplicación. Una versión privada del monorepositorio, una etiqueta o una compilación no demostrarían la publicación; aquí la evidencia de distribución es el registro de npm.

## Amethyst llega al escritorio y amplía el soporte de confianza

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) se publicó el 11 de octubre a las 19:27 UTC con artefactos para Android y para Linux, macOS y Windows, cada uno con un resumen SHA-256 registrado. Sus notas incluyen la aplicación de escritorio con interfaz compartida y una integración del índice de red y del proveedor de confianza NIP-85.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) llegó el 14 de octubre a las 13:16 UTC con otro conjunto completo de artefactos. La versión añade soporte de firmante remoto NIP-46 al inicio de sesión, eventos Calendar Collection y RSVP, soporte nativo de Wayland, límites por cliente para relés con retroceso NIP-01 y correcciones para la sincronización de la red de confianza y las descargas de Web of Trust en escritorio.

El cambio práctico es la separación de responsabilidades. NIP-46 permite que un cliente solicite firmas a un firmante remoto en vez de guardar la clave de firma. NIP-85 ofrece una forma estándar de consumir afirmaciones de confianza, pero siguen dependiendo del proveedor y de sus datos. Ninguna función convierte una puntuación de confianza en una verdad objetiva ni elimina la revisión de las solicitudes de firma.

## Límite de publicación de la extensión

No se publicó ninguna versión de Nostr WoT Extension durante esta ventana. La última antes del cierre siguió siendo [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), que las tiendas de Chrome y Firefox mostraban como actual el 9 de octubre. La siguiente versión de GitHub, 0.8.13, se publicó el 17 de octubre, después del cierre de esta edición, por lo que su funcionalidad queda excluida.

## Una comprobación prudente antes de actualizar

Para SDK 2.0.0, revisa el cambio a GPL-3.0-only, fija las versiones resueltas y ejecuta la compilación y las pruebas de tu aplicación. Para Amethyst, descarga solo el artefacto correspondiente al sistema y la arquitectura, compara su resumen registrado, guarda una copia de la configuración y prueba el emparejamiento NIP-46 primero con una cuenta de bajo riesgo. Confirma que el firmante muestra el evento esperado antes de aprobarlo. Trata los resultados NIP-85 como una señal para decidir, no como un límite de autorización.
