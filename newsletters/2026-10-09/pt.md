---
issue: "2026-10-09"
locale: "pt"
status: "prepared"
subject: "Account Archive chega ao Chrome e ao Firefox"
preheader: "Extensão 0.8.12 e SDK 1.0.4, verificados de 2 a 9 de outubro."
coverageStart: "2026-10-02T08:00:00Z"
coverageEnd: "2026-10-09T08:00:00Z"
timezone: "Europe/Zurich"
---

## Account Archive chega às duas lojas de navegadores

A [Nostr WoT Extension 0.8.12](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.12) já aparece como versão 0.8.12 na [Chrome Web Store](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) e no [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/nostr-wot-extension/). Ambas as lojas mostram 7 de outubro como data de atualização. A versão no GitHub foi publicada em 6 de outubro às 22:22 UTC e fornece arquivos separados para Chrome, Firefox e o código-fonte correspondente, além de resumos SHA-256 registados.

A versão anterior, 0.8.11, adicionou Account Archive às Definições. Pode sincronizar os relés selecionados manualmente ou de hora a hora, diariamente ou semanalmente, manter armazenamento local cifrado, agrupar relés e retomar a partir de pontos de controlo. Mostra contagens de eventos, tamanho do arquivo, progresso e erros por relé. A migração verifica um destino antes da confirmação, preserva as assinaturas originais, ignora eventos não elegíveis e mantém os detalhes dos eventos falhados para revisão.

A versão 0.8.12 permite descarregar e importar NDJSON comum de eventos assinados sem palavra-passe de ficheiro, mantendo a compatibilidade com exportações cifradas anteriores. Antes de combinar eventos importados, verifica se pertencem à conta e se têm assinaturas válidas. As janelas de importação e descarga também abrem sobre toda a janela da extensão, e não dentro do cartão de definições.

## SDK 1.0.4 publica componentes de protocolo partilhados

O registo npm mostra [nostr-wot-sdk 1.0.3](https://www.npmjs.com/package/nostr-wot-sdk) em 8 de outubro às 13:41 UTC e 1.0.4 às 16:23 UTC. A versão 1.0.3 moveu responsabilidades reutilizáveis de relés, carteira, dados e mensagens diretas para pacotes específicos. O cliente NIP-47 partilhado negoceia a cifragem, valida respostas, limita esperas e distingue uma falha de pagamento definitiva de um resultado incerto. As opções nativas de ligação NIP-46 oferecem ações traduzidas e transferência para a plataforma sem alterações do DOM específicas de cada aplicação.

A versão 1.0.4 adiciona carregamentos Blossom geridos, com uma cópia estável dos bytes de entrada, cancelamento pelo chamador e verificações de sessão ativa. Os redirecionamentos são rejeitados antes de tentar outro servidor configurado. Os carregamentos cifrados usam uma identidade de assinatura nova e descartável e autorização vinculada a cada servidor. O pacote de dados também pode limpar caches observáveis com chave sem remover subscritores.

O registo de alterações principal do repositório ainda termina no SDK 1.0.2. O detalhe destas duas versões do registo vem, portanto, do [PR de protocolos](https://github.com/nostr-wot/nostr-wot-sdk/pull/12), do [PR de Blossom e cache](https://github.com/nostr-wot/nostr-wot-sdk/pull/13) já integrados e do conteúdo publicado dos pacotes. Uma versão no registo não prova que todas as aplicações consumidoras foram atualizadas.

## Limites que vale a pena manter visíveis

Um arquivo NDJSON não cifrado deve ser tratado como dado local sensível, mesmo que os eventos mantenham assinaturas. As verificações de propriedade e assinatura protegem a integridade, mas não tornam o ficheiro confidencial. A sincronização depende dos relés escolhidos pelo utilizador e não promete retenção permanente nem um histórico completo.

No Blossom, identidades descartáveis e HTTPS reduzem a possibilidade de associação e a exposição no transporte de carregamentos cifrados, mas o servidor ainda pode observar o tamanho e o hash do texto cifrado, o endereço IP e o momento. Rejeitar redirecionamentos mantém os bytes e a autorização dentro da lista configurada, mas não torna privado um servidor não fiável.

## Uma verificação prática na atualização

Confirme que a extensão instalada indica 0.8.12 antes de testar Archive. Comece com uma sincronização manual num pequeno conjunto de relés conhecidos, reveja as contagens e os erros e mantenha os ficheiros exportados em armazenamento protegido. Quem adotar o SDK 1.0.4 deve fixar o valor de integridade publicado, testar o cancelamento e as mudanças de sessão e separar resultados de pagamento incertos de falhas confirmadas.
