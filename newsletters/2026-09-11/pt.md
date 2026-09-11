---
issue: "2026-09-11"
locale: pt
status: approved
subject: "Nostr WoT 0.7.0: mais controlo sobre as suas identidades"
preheader: "Caminhos personalizados, permissões mais claras e seis projetos para explorar."
coverageStart: "2026-09-04T08:07:05.572Z"
coverageEnd: "2026-09-11T08:07:05.572Z"
timezone: Europe/Zurich
---

## As suas identidades, com mais controlo

A extensão Nostr WoT **0.7.0** está disponível para [transferência no GitHub](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.7.0), publicada em **10 de setembro de 2026 às 22:29 UTC**. A [página atual do Chrome](https://chromewebstore.google.com/detail/nostr-wot-extension/gfmefgdkmjpjinecjchlangpamhclhdo) também mostra **0.7.0**, atualizada em **11 de setembro**. A disponibilidade na loja do Firefox continua **desconhecida**: a página e a API devolveram 404. Um ZIP do Firefox no GitHub não comprova aprovação na loja nem compatibilidade de instalação.

O [registo de alterações publicado](https://github.com/nostr-wot/nostr-wot-extension/blob/v0.7.0/CHANGELOG.md) inclui nomes de conta editáveis, caminhos de derivação personalizados em Advanced e pré-visualização da chave pública antes de criar uma subconta. As chaves padrão existentes não mudam. Guarde o caminho personalizado exato com a cópia da sua seed: o nome local da conta não é um segredo de recuperação.

Outras alterações permitem restaurar cópias cifradas da seed e das chaves PQ, distinguem permissões pontuais das permanentes e cifram a cache da carteira. As notas exigem Firefox para computador **140+** ou Android **142+** e descrevem novos pedidos de consentimento ao atualizar. Verifique os requisitos antes de escolher uma transferência.

## Para além da extensão

O **relayer 2.2.19**, [publicado em 8 de setembro](https://github.com/fiatjaf/relayer/releases/tag/v2.2.19), acrescenta uma interface para contar a união exata de filtros sobrepostos. O [diff](https://github.com/fiatjaf/relayer/compare/v2.2.18...v2.2.19) mostra um limite: o armazenamento tem de a implementar; os sistemas antigos continuam a somar contagens separadas e podem contar resultados repetidos.

Em **9 de setembro**, a [clarificação dos tipos de pagamento do NIP-A3](https://github.com/nostr-protocol/nips/pull/2463) acrescentou `bitcoincash` e `tron` e esclareceu esquemas URI para tipos desconhecidos ambíguos. É uma alteração da especificação, não prova de suporte em todos os clientes.

Verificámos os registos oficiais do npm dos **12 pacotes não privados do SDK**. Nenhuma versão foi publicada no período desta edição. O [pacote principal](https://registry.npmjs.org/nostr-wot-sdk) continua na versão **1.0.1**, publicada em **16 de agosto**: contexto, não uma novidade semanal.

## Seis novas entradas, não seis lançamentos

O nosso [índice de projetos](https://nostr-wot.com/projects) passou a incluir **Damus, Amethyst, Primal, Coracle, Amber e Nostur** em [8 de setembro](https://github.com/nostr-wot/nostr-wot/commit/979e9e7cb4130cceddd518fc394d5a649ad891f7). São projetos existentes agora indexados. Cada ficha liga às fontes e às pessoas ou perfis com atribuição verificada. O estado de desenvolvimento não é uma avaliação de segurança.

## Segurança: reforços, não um ataque confirmado

O registo da versão 0.7.0 documenta autorização mais rigorosa por conta e sessão e cancelamento de operações desatualizadas após bloquear ou mudar de conta. São correções e reforços publicados. As fontes revistas não demonstram exploração, vítimas afetadas nem uma cobertura completa dos incidentes.

## Um próximo passo útil

Leia o [guia de caminhos de identidade](https://nostr-wot.com/guides/custom-identity-paths) antes de usar Advanced. Entenda como a seed e o caminho exato recuperam uma identidade e por que mudar o nome local não altera a chave pública.
