---
issue: "2026-10-30"
locale: "pt"
status: "prepared"
subject: "SDK estável de passkeys e Extension 0.8.20 publicados"
preheader: "Pacotes verificados do npm e navegador de 23 a 30 de outubro, com mudanças de recuperação e endereço Lightning."
coverageStart: "2026-10-23T08:00:00Z"
coverageEnd: "2026-10-30T09:00:00Z"
timezone: "Europe/Zurich"
---

## Pacotes estáveis de passkeys estão no npm

O registro do npm publicou [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) às 20:24 UTC e [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk) às 20:25 UTC de 23 de outubro. Os dois pacotes apontam para o commit `384023f` e incluem valores de integridade do registro. Isso comprova distribuição, e não apenas uma tag ou compilação do repositório.

A versão estável torna explícitos os modos de passkey. Uma passkey derivada produz a chave Nostr a partir da saída PRF do WebAuthn, enquanto uma passkey armazenada protege uma chave, semente ou cofre com várias contas. Credenciais antigas ambíguas são indicadas como ambíguas em vez de serem interpretadas silenciosamente. Registros criptografados de recuperação podem usar armazenamento local, de provedor ou de relé controlado pelo host, mas o aplicativo continua responsável por WebAuthn, consentimento, transporte, verificação de assinaturas e testes de recuperação.

O SDK 3.0.1 também aceita backups explícitos do Nosskey e um assinador de provedor que fixa a janela iframe, a origem HTTPS e a conta selecionada. Suporte ao protocolo não prova que todo dispositivo, navegador ou provedor consiga recuperar uma conta. Desenvolvedores devem testar o autenticador e o caminho de armazenamento exatos que pretendem suportar.

## Extension 0.8.18 unifica importação e recuperação

A [Extension 0.8.18](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.18) foi publicada em 24 de outubro com pacotes separados para Chrome e Firefox, código-fonte e somas SHA-256. Ela detecta passkeys e backups compatíveis, mostra a identidade pública recuperada antes de salvar e pode recuperar backups compatíveis do Nosskey sem alterar a identidade original. Também restaura o pareamento opcional por som Wi-Fi em dispositivos de áudio de 44,1 kHz. A escuta começa apenas sob solicitação, termina após uma tentativa ou 30 segundos e ainda exige confirmação no telefone.

A [versão 0.8.19](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.19) corrige erros ao adicionar contas que reabriam indevidamente a configuração inicial de bloqueio automático. Contas duplicadas e falhas do cofre agora mostram o erro real com opção de nova tentativa e preservam a proteção existente.

## Endereços Lightning mais curtos na 0.8.20

A [versão 0.8.20](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.20) foi publicada em 29 de outubro. Endereços Lightning hospedados agora usam o domínio mais curto `@nostrwot.com` nas configurações, ações de cópia, QR de recebimento e atualizações opcionais do perfil. Endereços existentes `@zaps.nostr-wot.com` continuam chegando à mesma carteira. Endereços de provedores personalizados e o servidor API da carteira não mudaram, e a atualização do perfil ainda exige confirmação.

Antes de atualizar, instale o pacote do navegador correto e compare o SHA-256 com as somas da versão. Faça backup da configuração, confira a chave pública recuperada antes de salvar e teste a recuperação em um segundo dispositivo compatível. Uma mudança na exibição do endereço não exige descartar um endereço anterior que funciona.
