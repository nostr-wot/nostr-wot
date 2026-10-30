---
issue: "2026-10-23"
locale: "es"
status: "prepared"
subject: "Extension 0.8.17 mejora passkeys y firma local"
preheader: "Paquetes verificados del 16 al 23 de octubre y el límite exacto de la versión del SDK."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Cinco versiones verificadas de la extensión

Nostr WoT Extension publicó las versiones [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) a [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) durante la ventana de esta edición. Cada versión de GitHub incluye paquetes separados para Chrome y Firefox, código fuente reproducible, sumas SHA-256 y una hora de publicación no preliminar. Las tiendas de Chrome y Firefox mostraban 0.8.17 como versión actual el 23 de octubre.

La versión 0.8.13 añade creación y recuperación de bóvedas protegidas por passkey, archivos de recuperación cifrados, recuperación explícita mediante relés y un explorador del archivo. La recuperación por proveedor, archivo y relé son opciones distintas. La confirmación de un relé no demuestra que otro dispositivo pueda recuperar la cuenta, por lo que conviene conservar el archivo cifrado y probar la ruta elegida.

## La firma con teléfono sigue siendo experimental

La versión [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) añade un puente local experimental hacia una compilación compatible de Nostr WoT para teléfono mediante Wi-Fi, o Bluetooth cuando el navegador admite Web Bluetooth. El emparejamiento usa un código coincidente. El ordenador recibe una cuenta temporal Network y envía al teléfono las aprobaciones de firma o cifrado.

El puente admite firma NIP-07 y cifrado clásico NIP-04 y NIP-44. Las operaciones de identidad de cartera, la publicación interna y las operaciones poscuánticas no están disponibles mientras se usa la firma del teléfono. Al cerrar el puente se elimina la cuenta temporal y un teléfono desconectado nunca recurre a claves locales. El emparejamiento por sonido no está disponible en esta versión.

## Dados, monedas y permisos más claros

La versión [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) añade un flujo de frase de recuperación verificable sin conexión, con 256 lanzamientos de moneda como bits directos o entradas de dados procesadas con SHA-256. La pestaña separada registra las entradas, pero no muestra la frase resultante. También agrupa claves poscuánticas, Web of Trust y el puente local bajo Experimental, permite etiquetar cuentas sin nombre y evita que los relés inaccesibles bloqueen indefinidamente la incorporación.

La versión [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) reduce las solicitudes repetidas de acceso a relés. Una elección explícita Always puede cubrir todas las solicitudes pendientes para el sitio elegido o para todos los sitios conectados. Las concesiones siguen visibles y revocables en Permissions, así que conviene revisar el acceso amplio después de usarlo.

La versión [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) mantiene abierto el asistente de passkey mientras se guarda la primera cuenta y reutiliza la verificación reciente para la opción inicial de bloqueo automático. La autorización de un solo uso caduca a los cinco minutos y se revoca al bloquear, cambiar de cuenta o volver a autenticarse.

## Límite de publicación y comprobación de actualización

No se publicó un nuevo paquete del SDK antes del cierre del 23 de octubre a las 08:00 UTC. nostr-wot-sdk 2.0.0 siguió siendo por tanto la última versión verificada dentro de la ventana. La solicitud de cambios para SDK 3.0.1 no se integró hasta las 20:21 UTC de ese día, por lo que corresponde a la siguiente edición.

Antes de actualizar, elige el paquete del navegador correcto, compara su SHA-256 con las sumas de la versión y conserva un método de recuperación funcional. Trata el puente del teléfono como experimental, revisa los permisos de relé recordados y confirma que la recuperación con passkey funciona en un segundo dispositivo compatible antes de depender de ella.
