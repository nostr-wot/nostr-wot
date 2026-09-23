---
issue: "2026-09-18"
locale: "pt"
status: "prepared"
subject: "Amethyst encontra comentários aninhados mais cedo"
preheader: "Uma correção publicada e as versões de referência de 11 a 18 de setembro."
coverageStart: "2026-09-11T08:00:00Z"
coverageEnd: "2026-09-18T08:00:00Z"
timezone: "Europe/Zurich"
---

## Uma melhoria publicada na descoberta de respostas

O [Amethyst 1.15.2](https://github.com/vitorpamplona/amethyst/releases/tag/v1.15.2), publicado em 12 de setembro às 14:42 UTC, inclui downloads para Android e desktop. A [alteração dos filtros NIP-22](https://github.com/vitorpamplona/amethyst/pull/4095) permite descobrir comentários aninhados pela raiz da conversa, além das consultas existentes para respostas diretas.

A diferença é pequena, mas relevante: uma resposta a um comentário identifica a conversa original numa etiqueta em maiúscula, enquanto a etiqueta em minúscula aponta para o elemento pai imediato. Procurar apenas o pai omite essa resposta aninhada ao consultar o item original. Filtros separados pela raiz corrigem a consulta. A disponibilidade dos relés e os limites temporais continuam a determinar os eventos recebidos; a alteração não garante que todas as respostas sejam carregadas.

A mesma versão corrige a descoberta de atualizações de pedidos de alteração NIP-34. A nossa [análise do código](https://nostr-wot.com/news/nip-22-amethyst-loads-nested-comments) explica ambos os casos. Os downloads no GitHub comprovam a distribuição nesse canal, não a publicação numa loja de aplicações.

## A extensão e o SDK no fecho desta edição

Esta edição recuperada cobre de 11 de setembro às 08:00 UTC até 18 de setembro às 08:00 UTC. O [download 0.7.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0) da extensão, publicado em 10 de setembro às 22:29 UTC, continua a ser a referência do GitHub no fecho. É contexto da edição anterior. O [registo de alterações publicado](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) descreve mudanças nos caminhos de identidade e na recuperação; um ZIP para Firefox não comprova disponibilidade na loja Firefox.

Os registos oficiais do npm para os 12 pacotes não privados do SDK não mostram versões publicadas neste período. A referência do [pacote principal](https://registry.npmjs.org/nostr-wot-sdk) é 1.0.1, publicada em 16 de agosto. As versões de 19 e 20 de setembro pertencem à próxima edição e ficam excluídas.

## Uma verificação útil para quem desenvolve clientes

Se uma resposta aninhada só aparece ao abrir a conversa, compare os filtros do pai direto e da raiz antes de atribuir o problema a conteúdo ausente. O patch do Amethyst oferece uma implementação concreta para estudar. Use eventos de teste descartáveis e inspecione a consulta real ao relé; uma etiqueta do protocolo e o seu tratamento pelo cliente são coisas distintas.
