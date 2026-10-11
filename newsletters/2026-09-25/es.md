---
issue: "2026-09-25"
locale: "es"
status: "prepared"
subject: "Nostr WoT añade conexiones de cartera limitadas por aplicación"
preheader: "Extensión 0.8.3, versiones del grafo en npm y Amber 6.6.5, verificadas del 18 al 25 de septiembre."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Acceso separado a la cartera para cada aplicación

[Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), publicada el 23 de septiembre a las 07:28 UTC, puede crear varias conexiones Nostr Wallet Connect para la cartera LNbits de la extensión. Cada aplicación puede recibir una conexión propia con nombre, límite diario de gasto y fecha de caducidad. Los ajustes de la cartera muestran las conexiones activas y el uso del presupuesto, y permiten copiar una cadena de conexión, mostrar su código QR o revocarla sin sustituir el acceso de las demás aplicaciones.

Las notas de la versión indican que los secretos de conexión siguen cifrados localmente y que se pueden recuperar registros interrumpidos. La validación utilizó una cartera LNbits vacía para crear, listar y revocar conexiones y completar un intercambio NWC `get_info` firmado. No se envió ningún pago real. Los servidores LNbits personalizados necesitan un adaptador de gestión compatible, por lo que no todas las implementaciones de NWC ofrecen necesariamente los mismos controles.

La versión 0.8.3 incluye las versiones 0.8 anteriores. La [versión 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) recuperó la API experimental `window.nostr.wot` como opción explícita, desactivada de forma predeterminada, y añadió sincronización acotada del grafo, avisos al sustituir listas de contactos y puntuación basada en silenciados de la cuenta. GitHub ofrece archivos ZIP para Chrome, Firefox y el código fuente con resúmenes SHA-256 registrados. Estas descargas acreditan la distribución en GitHub, no la publicación en las tiendas. El listado actual de Chrome se comprobó durante la recuperación, pero no permite reconstruir la versión de la tienda al cierre del 25 de septiembre. No se encontró un listado coincidente en Firefox Add-ons, por lo que esta edición no afirma disponibilidad en esa tienda.

## Los paquetes del grafo llegan a npm

El registro de npm sitúa [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) el 20 de septiembre a las 00:17 UTC y el paquete principal [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) un minuto después. La versión del grafo agrupa consultas a relés, añade un límite explícito de saltos, conserva versiones deterministas de eventos reemplazables y comprime las listas de contactos persistidas. También limita las consultas de distancia por lotes y conserva las escrituras pendientes si falla el volcado.

Hay un límite de migración que conviene planificar: la base de datos del grafo pasa al esquema 2 de IndexedDB y las versiones antiguas del SDK no pueden volver a abrir un espacio de nombres actualizado. Prueba la actualización con un perfil desechable o una caché reconstruible antes de aplicarla a datos persistentes. La versión 0.3.1 llegó a las 10:47 UTC y es la última versión del grafo al cierre de esta edición. Su registro de cambios describe solo documentación y declara que no hay cambios de ejecución.

## Amber reduce el alcance de un permiso sobre copias de seguridad

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), publicada el 21 de septiembre a las 14:32 UTC, cifra las copias de seguridad del firmante con una clave dedicada derivada mediante HKDF fuera del espacio de derivación NIP-44. Según las notas, esto impide que una aplicación con permiso `nip44_decrypt` recordado use ese permiso para leer cargas de copia de seguridad que contienen secretos NIP-46 por aplicación y claves locales.

Las copias antiguas cifradas con la clave de identidad todavía pueden restaurarse hasta que una nueva publicación las sobrescriba. La versión ofrece archivos APK de Android y un manifiesto de comprobaciones firmado. Eso acredita artefactos disponibles y una ruta de verificación, no la instalación en un dispositivo concreto ni el despliegue en todas las tiendas. El proyecto informa de un límite corregido, no de un incidente explotado ni de un número de usuarios afectados.

## Una comprobación práctica al actualizar

Asigna a cada aplicación de cartera una conexión distinta con el menor límite diario útil y una fecha de caducidad. Después confirma que revocar una no afecta a las demás. Para el SDK, prueba la migración del esquema y la reconstrucción de la caché antes de usar el nuevo paquete del grafo con datos persistentes. Para Amber, verifica la versión instalada y publica una copia nueva si dependes de la recuperación desde relés. Estas comprobaciones reducen el acceso compartido y las sorpresas de formato sin tratar las notas de una versión como prueba de todos los despliegues.
