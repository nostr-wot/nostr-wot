---
issue: "2026-10-16"
locale: "pt"
status: "prepared"
subject: "SDK 2.0.0 publicado, Amethyst adiciona ferramentas de confiança"
preheader: "Versões verificadas do SDK, desktop, assinador e Web of Trust de 9 a 16 de outubro."
coverageStart: "2026-10-09T08:00:00Z"
coverageEnd: "2026-10-16T08:00:00Z"
timezone: "Europe/Zurich"
---

## SDK 2.0.0 está publicado no npm

O registro do npm mostra o [nostr-wot-sdk 2.0.0](https://www.npmjs.com/package/nostr-wot-sdk) em 12 de outubro, às 22:32 UTC. O pacote publicado aponta para o commit `2937df1`, inclui um valor de integridade do registro e muda o código próprio do projeto de MIT para GPL-3.0-only. Versões publicadas anteriormente mantêm a licença original. O [changelog publicado](https://github.com/nostr-wot/nostr-wot-sdk/blob/2937df1b87d0593006b4482d10997cccfac696d1/packages/sdk/CHANGELOG.md) lista versões principais correspondentes dos pacotes com escopo de autenticação, Blossom, dados, mensagens diretas, grafo, relés, assinadores, interface, carteira e WoT.

Esta é uma versão de licenciamento, não evidência de um novo recurso em execução. Antes de atualizar, desenvolvedores devem avaliar a compatibilidade da licença, fixar o valor de integridade do registro e testar o conjunto exato de pacotes instalado pelo aplicativo. Uma versão privada do monorepositório, uma tag ou uma compilação isolada não provariam a publicação; o registro do npm é a evidência de distribuição.

## Amethyst chega ao desktop e amplia o suporte de confiança

[Amethyst 1.18.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.18.0) foi publicado em 11 de outubro, às 19:27 UTC, com artefatos para Android, Linux, macOS e Windows, cada um com resumo SHA-256 registrado. As notas incluem o aplicativo desktop de interface compartilhada e uma integração do índice de rede e do provedor de confiança NIP-85.

[Amethyst 1.19.0](https://github.com/vitorpamplona/amethyst/releases/tag/v1.19.0) veio em 14 de outubro, às 13:16 UTC, com outro conjunto completo de artefatos. A versão adiciona suporte ao assinador remoto NIP-46 no login, eventos Calendar Collection e RSVP, suporte nativo ao Wayland, limite por cliente para relés com recuo NIP-01 e correções para sincronização da rede de confiança e downloads de Web of Trust no desktop.

A mudança prática é a separação de responsabilidades. O NIP-46 permite que um cliente solicite assinaturas a um assinador remoto em vez de manter a chave de assinatura. O NIP-85 oferece uma forma padrão de consumir afirmações de confiança, mas elas continuam dependentes do provedor e de seus dados. Nenhum dos recursos transforma uma pontuação de confiança em verdade objetiva nem elimina a revisão das solicitações de assinatura.

## Limite da versão da extensão

Nenhuma versão da Nostr WoT Extension foi publicada nesta janela. A última antes do corte continuou sendo a [0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12), que as lojas do Chrome e Firefox mostravam como atual em 9 de outubro. A próxima versão no GitHub, 0.8.13, foi publicada em 17 de outubro, após o corte desta edição, por isso sua funcionalidade foi excluída.

## Uma verificação cuidadosa antes de atualizar

Para o SDK 2.0.0, revise a mudança para GPL-3.0-only, fixe as versões resolvidas e execute a compilação e os testes do aplicativo. Para o Amethyst, baixe apenas o artefato correto para o sistema e a arquitetura, compare o resumo registrado, faça backup da configuração e teste primeiro o pareamento NIP-46 com uma conta de baixo risco. Confirme que o assinador exibe o evento esperado antes de aprová-lo. Trate resultados NIP-85 como uma entrada para a decisão, não como limite de autorização.
