---
issue: "2026-11-06"
locale: "pt"
status: "prepared"
subject: "Extension 0.8.22 melhora assinatura remota e recuperação"
preheader: "Versões verificadas para download de 30 de outubro a 6 de novembro, além do Amethyst 1.21."
coverageStart: "2026-10-30T09:00:00Z"
coverageEnd: "2026-11-06T09:00:00Z"
timezone: "Europe/Zurich"
---

## Extension 0.8.21 adiciona modelos de permissão e recuperação mais segura

[Nostr WoT Extension 0.8.21](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.21) foi publicada em 2 de novembro às 18:46 UTC. A versão inclui arquivos para Chrome, Firefox e código-fonte, além de somas SHA-256. Esses artefatos comprovam a distribuição pelo GitHub, mas não a aprovação nas lojas dos navegadores.

A versão adiciona modelos opcionais de permissão ao conectar um site, incluindo uma predefinição para o Nostr WoT Playground. Também reorganiza frases-semente, chaves privadas e recuperação por passkey em Chaves e backups, agrupa solicitações de autenticação de relés e esclarece decisões em lote de uso único.

As mudanças relacionadas à segurança verificam novamente as permissões do grafo após a aprovação e serializam mudanças de consentimento, evitando que uma negação ou desconexão mais recente seja substituída por uma ação pendente anterior. Backups do provedor de passkey agora respeitam o limite de 2 KB ao armazenar apenas o material de chave associado, em vez de um cofre crescente. Arquivos de recuperação existentes e backups antigos continuam legíveis.

## Aprovações do assinador remoto permanecem no assinador na 0.8.22

[A versão 0.8.22](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.22) veio em 2 de novembro às 19:18 UTC com arquivos próprios para Chrome, Firefox e código-fonte, além de somas SHA-256. Contas Nostr Connect agora delegam assinatura, autenticação, mudanças na lista de contatos e criptografia ou descriptografia de mensagens ao assinador externo sem avisos duplicados da extensão. A extensão continua aplicando conexão do site, acesso à identidade, validação e permissões de carteira e grafo.

A verificação das lojas em 5 de novembro ainda mostrava 0.8.17 no Chrome e Firefox. Por isso, 0.8.21 e 0.8.22 são descritas como versões para download, não como atualizações de loja. O npm ainda mostrava [@nostr-wot/identity 1.1.0](https://www.npmjs.com/package/@nostr-wot/identity) e [nostr-wot-sdk 3.0.1](https://www.npmjs.com/package/nostr-wot-sdk), publicados em 23 de outubro. Nenhum novo pacote do SDK foi publicado nesta janela.

## Amethyst 1.21 leva pequenos aplicativos às notas

[Amethyst 1.21.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.21.0) foi publicado em 1 de novembro com artefatos para Android e desktop. Ele executa NApplets e apps WebXDC dentro de notas, adiciona formatos de áudio e jogos e apresenta uma configuração guiada da Web de Confiança. O lançamento também limita o acesso dos apps incorporados: a leitura de eventos privados exige permissão de descriptografia, eventos assinados são verificados antes da entrega e os frames não recebem cookies, WebRTC nem chaves de identidade.

É uma atualização publicada de um cliente existente, não o lançamento de um novo projeto nem evidência de um incidente explorado.

Antes de instalar um pacote, escolha o arquivo correto para o navegador e compare a soma SHA-256 com os metadados da versão. Faça backup da configuração, confirme a identidade pública antes de salvar uma recuperação e revise cada solicitação mostrada pelo assinador externo.
