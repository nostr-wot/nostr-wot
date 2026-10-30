---
issue: "2026-10-30"
locale: "es"
status: "prepared"
subject: "SDK estable de passkeys y Extension 0.8.20 publicados"
preheader: "Paquetes verificados de npm y navegador del 23 al 30 de octubre, con cambios de recuperación y dirección Lightning."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## Los paquetes estables de passkeys están en npm

El registro de npm publicó [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) a las 20:24 UTC y [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) a las 20:25 UTC del 23 de octubre. Ambos paquetes apuntan al commit `384023f` e incluyen valores de integridad del registro. Esto demuestra la distribución, no solo una etiqueta o compilación del repositorio.

La versión estable distingue los modos de passkey. Una passkey derivada produce la clave Nostr desde la salida PRF de WebAuthn, mientras que una passkey almacenada protege una clave, semilla o bóveda con varias cuentas. Las credenciales heredadas ambiguas se indican como ambiguas en lugar de interpretarse sin aviso. Los registros cifrados de recuperación pueden usar almacenamiento local, de proveedor o de relé controlado por el host, pero la aplicación sigue siendo responsable de WebAuthn, consentimiento, transporte, comprobación de firmas y pruebas de recuperación.

SDK 3.0.1 también admite copias explícitas de Nosskey y un firmante de proveedor que fija la ventana iframe, el origen HTTPS y la cuenta elegida. La compatibilidad del protocolo no demuestra que todos los dispositivos, navegadores o proveedores puedan recuperar una cuenta. Los desarrolladores deben probar el autenticador y la ruta de almacenamiento exactos que pretenden admitir.

## Extension 0.8.18 unifica importación y recuperación

[Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) se publicó el 24 de octubre con paquetes separados para Chrome y Firefox, código fuente y sumas SHA-256. Detecta passkeys y copias compatibles, muestra la identidad pública recuperada antes de guardar y puede recuperar copias compatibles de Nosskey sin cambiar la identidad original. También restaura el emparejamiento opcional por sonido Wi-Fi en dispositivos de audio de 44,1 kHz. La escucha comienza solo a petición, termina tras un intento o 30 segundos y aún requiere confirmación en el teléfono.

[La versión 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) corrige errores al añadir cuentas que reabrían por error la configuración inicial de bloqueo automático. Las cuentas duplicadas y los fallos de bóveda muestran ahora el error real con una opción de reintento y conservan la protección existente.

## Direcciones Lightning más cortas en 0.8.20

[La versión 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) se publicó el 29 de octubre. Las direcciones Lightning alojadas usan ahora el dominio más corto `@nostrwot.com` en la configuración, las acciones de copia, los QR de recepción y las actualizaciones opcionales del perfil. Las direcciones existentes `@zaps.nostr-wot.com` siguen llegando a la misma cartera. Las direcciones de proveedores personalizados y el servidor API de cartera no cambian, y la actualización del perfil aún requiere confirmación.

Antes de actualizar, instala el paquete del navegador correcto y compara su SHA-256 con las sumas de la versión. Guarda una copia de la configuración, comprueba la clave pública recuperada antes de guardar y prueba la recuperación en un segundo dispositivo compatible. Un cambio de visualización de dirección no obliga a descartar una dirección anterior que funciona.
