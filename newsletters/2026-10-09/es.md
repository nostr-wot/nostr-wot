---
issue: "2026-10-09"
locale: "es"
status: "prepared"
subject: "Account Archive llega a Chrome y Firefox"
preheader: "Extensión 0.8.12 y SDK 1.0.4, verificados del 2 al 9 de octubre."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive llega a las dos tiendas de navegadores

[Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) ya figura como versión 0.8.12 en [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) y en [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/). Ambas tiendas muestran el 7 de octubre como fecha de actualización. La versión de GitHub se publicó el 6 de octubre a las 22:22 UTC y ofrece archivos separados para Chrome, Firefox y el código fuente correspondiente, además de resúmenes SHA-256 registrados.

La versión anterior, 0.8.11, añadió Account Archive en Ajustes. Puede sincronizar los relés seleccionados de forma manual o cada hora, día o semana, mantener almacenamiento local cifrado, agrupar relés y reanudar desde puntos de control. Muestra el número de eventos, el tamaño del archivo, el progreso y los errores por relé. La migración comprueba el destino antes de pedir confirmación, conserva las firmas originales, omite los eventos no aptos y mantiene los detalles de los fallos para revisarlos.

La versión 0.8.12 permite descargar e importar NDJSON ordinario de eventos firmados sin contraseña de archivo y conserva la compatibilidad con exportaciones cifradas anteriores. Antes de combinar los eventos importados, comprueba que pertenecen a la cuenta y que las firmas son válidas. Los diálogos de importación y descarga también se abren sobre toda la ventana emergente, no dentro de la tarjeta de ajustes.

## SDK 1.0.4 publica componentes de protocolo compartidos

El registro de npm sitúa [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) el 8 de octubre a las 13:41 UTC y 1.0.4 a las 16:23 UTC. La versión 1.0.3 trasladó responsabilidades reutilizables de relés, cartera, datos y mensajes directos a paquetes específicos. El cliente NIP-47 compartido negocia el cifrado, valida respuestas, limita las esperas y distingue un fallo de pago definitivo de un resultado incierto. Las opciones nativas de conexión NIP-46 ofrecen acciones traducidas y transferencia a la plataforma sin parches del DOM propios de cada aplicación.

La versión 1.0.4 añade cargas gestionadas a Blossom con una copia estable de los bytes de entrada, cancelación por el llamador y comprobaciones de sesión activa. Rechaza redirecciones antes de probar otro servidor configurado. Las cargas cifradas usan una identidad de firma nueva y desechable y autorización vinculada a cada servidor. El paquete de datos también puede vaciar cachés observables con clave sin eliminar suscriptores.

El registro de cambios raíz del repositorio todavía termina en SDK 1.0.2. El detalle de estas dos versiones del registro procede por tanto del [PR de protocolos](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), del [PR de Blossom y caché](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) ya fusionados y del contenido publicado de los paquetes. Una versión en el registro no demuestra que todas las aplicaciones consumidoras se hayan actualizado.

## Límites que conviene mantener visibles

Un archivo NDJSON sin cifrar debe tratarse como dato local sensible aunque sus eventos conserven las firmas. Las comprobaciones de propiedad y firma protegen la integridad, pero no hacen confidencial el archivo. La sincronización depende de los relés elegidos por el usuario y no promete retención permanente ni un historial completo.

En Blossom, las identidades desechables y HTTPS reducen la vinculación y la exposición durante el transporte de cargas cifradas, pero el servidor todavía puede observar el tamaño y el hash del texto cifrado, la dirección IP y el momento. Rechazar redirecciones mantiene los bytes y la autorización dentro de la lista configurada, pero no convierte en privado a un servidor no confiable.

## Una comprobación práctica al actualizar

Confirma que la extensión instalada indica 0.8.12 antes de probar Archive. Empieza con una sincronización manual en un conjunto pequeño de relés conocidos, revisa los recuentos y errores y guarda los archivos exportados en almacenamiento protegido. Quienes adopten SDK 1.0.4 deben fijar el valor de integridad publicado, probar la cancelación y los cambios de sesión y separar los resultados de pago inciertos de los fallos confirmados.
