---
issue: "2026-11-06"
locale: "es"
status: "prepared"
subject: "Extension 0.8.22 mejora la firma remota y la recuperación"
preheader: "Versiones descargables verificadas del 30 de octubre al 6 de noviembre, más Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 añade plantillas de permisos y una recuperación más segura

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) se publicó el 2 de noviembre a las 18:46 UTC. La versión incluye archivos descargables para Chrome, Firefox y el código fuente, junto con sumas SHA-256. Estos artefactos demuestran que la versión se distribuyó mediante GitHub, pero no prueban la aprobación en las tiendas de los navegadores.

La versión añade plantillas de permisos opcionales al conectar un sitio, incluido un ajuste para Nostr WoT Playground. También reorganiza las frases semilla, las claves privadas y la recuperación con passkeys dentro de Claves y copias, agrupa las solicitudes de autenticación de relés y aclara las decisiones masivas de un solo uso.

Los cambios relacionados con seguridad vuelven a comprobar los permisos del grafo después de la aprobación y serializan los cambios de consentimiento para que una denegación o desconexión más reciente no sea reemplazada por una acción pendiente anterior. Las copias del proveedor de passkeys respetan ahora el límite de escritura de 2 KB al guardar solo el material de clave asociado en lugar de una bóveda creciente. Los archivos de recuperación existentes y las copias antiguas del proveedor siguen siendo legibles.

## Las aprobaciones del firmante remoto permanecen en el firmante en 0.8.22

[La versión 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) se publicó el 2 de noviembre a las 19:18 UTC con sus propios archivos de Chrome, Firefox y código fuente, además de sumas SHA-256. Las cuentas de Nostr Connect delegan ahora la firma, la autenticación, los cambios de contactos y el cifrado o descifrado de mensajes al firmante externo sin añadir avisos duplicados de aprobación en la extensión. La extensión sigue aplicando la conexión del sitio, el acceso a la identidad, la validación y los permisos de cartera y grafo.

La comprobación de las tiendas del 5 de noviembre seguía mostrando 0.8.17 en Chrome y Firefox. Por eso, 0.8.21 y 0.8.22 se describen aquí como versiones descargables, no como actualizaciones de tienda. npm seguía mostrando [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) y [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), publicados el 23 de octubre. No hubo un nuevo paquete del SDK en esta ventana.

## Amethyst 1.21 lleva pequeñas aplicaciones a las notas

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) se publicó el 1 de noviembre con artefactos para Android y escritorio. Puede ejecutar NApplets y aplicaciones WebXDC dentro de notas, añade formatos de escucha y juegos e incorpora una configuración guiada de Web de Confianza. También restringe el acceso de las aplicaciones integradas: la lectura de eventos privados requiere permiso de descifrado, los eventos firmados se verifican antes de entregarse y los marcos no reciben cookies, WebRTC ni claves de identidad.

Es una actualización publicada de un cliente existente, no el lanzamiento de un proyecto nuevo ni evidencia de un incidente explotado.

Antes de instalar un paquete descargable, elige el archivo correcto para tu navegador y compara su suma SHA-256 con los metadatos de la versión. Guarda una copia de la configuración, confirma la identidad pública antes de guardar una recuperación y revisa cada solicitud que muestre el firmante externo.
