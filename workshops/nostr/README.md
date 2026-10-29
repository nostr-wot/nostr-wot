# Nostr WoT · Laboratorio LABITCONF

Laboratorio en español para teléfono y computadora. Destino público: https://nostrwot.com/labs.

## Recorrido

La bienvenida abre la elección de conexión. Después hay cinco pasos: Perfil, Publicación, Personas, Archivo y Apps. Cada paso aparece por separado; en móvil, Atrás, el contador y Continuar permanecen abajo. La ayuda contextual incluye diagramas y ejemplos desplegables. Firmar y verificar sin publicar son ejercicios opcionales dentro de Ayuda.

El perfil y la actividad se consultan automáticamente al conectar. Las sugerencias de personas cargan nombres y fotos automáticamente y usan la lista de la extensión. El editor conserva los campos adicionales del perfil. Las fotos elegidas se optimizan y se suben a Blossom después de autorizar la subida. Los seguimientos nuevos conservan los contactos anteriores y se bloquean si no se completan las consultas necesarias.

## Identidad y autorización

Se puede usar una extensión NIP-07, una app firmante NIP-46 o una identidad temporal generada en memoria. La identidad temporal se pierde al recargar o descartar la sesión. El perfil de prueba incluye una descripción de su uso durante LABITCONF. No se importan claves privadas ni frases de recuperación.

Publicar requiere revisar el evento, autorizar la firma y confirmar el envío. Cada relay informa aceptación, rechazo o falta de confirmación. No hay reintentos automáticos. Las consultas públicas a relays no requieren una firma, pero exponen al relay la IP y los filtros consultados. El grafo del ejercicio es sintético.

El paso Apps ofrece Obelisk, Sky Obelisk, La Wallet, Coracle, Primal y Nostrich. La identidad temporal puede actuar como firmante NIP-46 mientras esta pestaña permanezca abierta: se genera un enlace Bunker de un solo uso o se pega el enlace nostrconnect de la app. Vincular una app y firmar, cifrar o descifrar requieren aprobación. La conexión usa una clave de transporte separada, mensajes NIP-44 y eventos firmados. Descartar la sesión corta la conexión. No hay almacenamiento persistente ni autorización de pagos NWC. El protocolo no acredita el dominio de la app. No guardar fondos con una identidad temporal.

## Abrir una copia local

En una computadora con Node.js 20 o superior, ejecutar `node scripts/serve.mjs` y abrir la dirección que indica. Los archivos compilados están incluidos. Para modificar el código: `npm ci`, `npm test`, `npm run build`. El ZIP excluye dependencias instaladas y otros archivos privados.

## Marca y movimiento

El logo animado y el fondo provienen de `AnimatedWotLogo.tsx` y `HeroAnimation.tsx` del sitio oficial, con sus estilos originales. Las ilustraciones oficiales están en `dist/assets/official`. Se respeta la preferencia de movimiento reducido. El color de marca es #6366f1 con opacidades.

## Validación y límites

Las pruebas cubren firmas, preservación de perfiles y seguimientos, autorización Blossom, confirmaciones de relays y NIP-46 temporal: token, identidad correcta, aprobación, repetición de solicitudes y cierre durante una aprobación. Se comprobó el flujo visual en escritorio y a 360 px, la carga automática de perfiles y la generación de un enlace Bunker contra relays reales. Falta validar el emparejamiento completo con cada app en un teléfono real. La disponibilidad de Android y TestFlight depende de `dist/distribution.json`.

Fuentes: https://github.com/nostr-protocol/nips/blob/master/01.md, https://github.com/nostr-protocol/nips/blob/master/46.md, https://github.com/nostr-wot/nostr-wot y https://github.com/nostr-wot/nostr-wot-extension.

## Ayuda, cuenta y progreso

Un recorrido breve aparece en la primera visita y se puede omitir o volver a abrir desde Ayuda. La explicación interactiva de la red se abre desde el icono de información. El botón de cuenta muestra nombre y foto; permite abrir el perfil con portada, notas y seguidos, o desconectar. Tras publicar se ofrecen enlaces a Nostr WoT, njump y Coracle para ver la misma identidad.

Solo las conexiones con extensión guardan el paso y los ejercicios completados en el navegador. Al recargar se vuelve a consultar la clave pública y se restaura el avance únicamente si coincide. Las sesiones temporales se reinician. No se guardan claves privadas.

## Archivo de eventos

El paso Archivo descarga eventos firmados por la identidad conectada desde los relays configurados. La consulta paginada conserva los límites de fecha inclusivos y deduplica eventos. Una interrupción, límite o fecha con demasiados resultados se informa como copia parcial. Máximo 5000 eventos y 18 MB; no se garantiza que los relays conserven todos los eventos históricos.

La importación admite JSON de hasta 20 MB y verifica autor y firmas. Rechaza solicitudes efímeras de firma, conexión o pago. El envío a un solo relay requiere revisión y consentimiento, conserva las firmas originales y muestra aceptados, rechazados, pendientes y sin confirmación. Se puede detener entre eventos. Las imágenes y videos se conservan como enlaces.

Las pruebas locales de navegador usan `tests/browser-fixture.mjs` con identidad de prueba y WebSocket simulado. Sus archivos compilados no se distribuyen ni publican. El flujo de publicación y archivo fue comprobado sin enviar eventos reales; el emparejamiento completo con apps externas y las subidas reales de fotos siguen pendientes de prueba con un teléfono.
