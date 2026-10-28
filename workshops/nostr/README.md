# Nostr WoT · laboratorio de LABITCONF

Laboratorio en español para celular y computadora. Identidad temporal o extensión Nostr WoT, firma real con el SDK, verificación y grafo sintético editable. Publicación explícita de notas (kind 1), perfiles (kind 0) y reacciones (kind 7). Sin wallet ni claves privadas importadas.

## Usar sin instalar paquetes

Necesitás Node.js 20+ en computadora. Ejecutá `node scripts/serve.mjs` y abrí http://localhost:8765. Los bundles están incluidos. En celular usá el sitio HTTPS. Con la página ya cargada, los ejercicios temporales siguen funcionando sin red mientras no cierres ni recargues la pestaña. No se promete caché offline persistente.

## Desarrollo

`npm install`, `npm test`, `npm run build`, `npm start`.

Las dependencias están fijadas. La descarga ZIP incluye código, bundles y tutoriales. Generar ZIP después de build, excluyendo el ZIP mismo, node_modules, .git y credenciales.

## Límites

La clave de práctica solo vive en memoria. No usarla como identidad duradera. Los pasos 01–04 no publican. El paso 05 y el editor de perfil permiten firmar y después publicar explícitamente a relays configurables. Un evento firmado descargado también puede publicarse por terceros. Usar contenido de prueba. El SDK verifica la firma y la coincidencia con la solicitud. El grafo no representa datos reales. NIP-07 identifica una interfaz, no certifica qué extensión la ofrece; usar Nostr WoT como único proveedor para el taller. La extensión en celular depende del soporte del navegador. No se anuncian extensiones para iOS/Safari.

El alojamiento inicial es privado para revisión de León. Antes del taller se debe habilitar explícitamente el acceso para asistentes; no compartir el enlace privado como si fuera público.

## Fuentes

- https://nostrwot.com/download — instalación oficial, consultada 2026-10-26
- https://github.com/nostr-wot/nostr-wot-sdk — SDK 3.0.1
- https://github.com/nostr-wot/nostr-wot-sdk/tree/main/packages/wot — módulo WoT
- Marca: logotipo oficial de Nostr WoT y paleta indigo #6366f1 / purple #8b5cf6

## Navegación

Los cuatro ejercicios están en una página continua. La barra fija muestra el npub de la sesión y permite desconectar. El tutorial lateral sigue la sección visible al hacer scroll; en celular usa un panel inferior desplazable. Desconectar elimina la sesión local, no revoca los permisos guardados por la extensión.

## Publicación real

La cuenta, el tutorial contextual y la actividad viven en un panel lateral. Las consultas a relays se disparan al cargar perfil/actividad o buscar una nota. Publicar requiere revisar una instantánea del evento y los relays, consentir el carácter público, firmar y pulsar Publicar. Los permisos de NIP-07 se solicitan a Nostr WoT. No hay envío automático ni reintentos automáticos.

Se verifica que la firma y todos los campos coincidan con la solicitud antes de publicar. Solo un OK positivo del relay para el ID exacto se registra como aceptado. Rechazos y resultados desconocidos se muestran por relay. No se implementa NIP-42: si un relay exige autenticación se informa al usuario. Un timeout no prueba que el evento no haya llegado.

Los perfiles cargados preservan metadatos adicionales al editar los campos visibles. Se consulta kind 0 por separado de las notas. Si no aparece un perfil, el usuario debe reconocer expresamente que crear uno podría reemplazar datos no recuperados. No existe garantía de haber encontrado la última versión en toda la red.

El historial muestra kind 0 como tarjeta de perfil, kind 1 como nota y kind 7 como reacción con sus referencias. Los detalles incluyen kind, autor, fecha, ID, etiquetas, JSON y confirmaciones por relay. La actividad permanece en memoria y puede recargarse desde los relays; no representa un historial completo.

Fuentes: NIP-01 https://github.com/nostr-protocol/nips/blob/master/01.md y NIP-25 https://github.com/nostr-protocol/nips/blob/master/25.md (consultados 2026-10-26).

Pruebas: firmas y alteraciones reales con SDK, preservación de perfil, escapes de HTML, composición de reacciones, validación de relays, OK positivo/negativo/timeout y verificación de eventos entrantes con WebSocket simulado. No se publican eventos de QA en relays públicos.

## Taller visual y móvil

El recorrido principal es instalar/conectar, editar perfil, publicar y explorar relaciones. Firmas y verificación quedan como ejercicios opcionales en Por dentro. Las ilustraciones SVG/CSS forman parte del código y no requieren recursos externos. Los valores largos y las instrucciones de instalación se abren en un panel derecho.

La conexión móvil usa NIP-46 desde el SDK, con QR local y enlace copiable que no se guarda. El lector de Nostr WoT admite escaneo y pegado (src/screens/Remote/Scan.tsx en la app). Se probó generar y cancelar la conexión en el navegador; falta una prueba de punta a punta en teléfono.

Los botones Android y TestFlight leen dist/distribution.json. Permanecen deshabilitados hasta configurar un APK firmado y su checksum, o una invitación externa real. La validación de configuración no certifica la disponibilidad ni seguridad del binario. ops/mobile-distribution.md registra los hallazgos y el procedimiento de distribución; no se ha ejecutado una compilación ni una entrega móvil desde este sitio.
