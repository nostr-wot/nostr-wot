---
issue: "2026-09-25"
locale: "pt"
status: "prepared"
subject: "Nostr WoT adiciona conexões de carteira limitadas por aplicação"
preheader: "Extensão 0.8.3, versões do grafo no npm e Amber 6.6.5, verificadas de 18 a 25 de setembro."
coverageStart: "2026-09-18T08:00:00Z"
coverageEnd: "2026-09-25T08:00:00Z"
timezone: "Europe/Zurich"
---

## Acesso separado à carteira para cada aplicação

A [Nostr WoT Extension 0.8.3](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.3), publicada em 23 de setembro às 07:28 UTC, pode criar várias conexões Nostr Wallet Connect para a carteira LNbits da extensão. Cada aplicação pode receber uma ligação própria com nome, limite diário de gastos e data de validade. As definições da carteira mostram ligações ativas e utilização do orçamento, e permitem copiar uma string de ligação, mostrar o respetivo código QR ou revogá-la sem substituir o acesso das outras aplicações.

As notas da versão dizem que os segredos das ligações permanecem cifrados localmente e que registos interrompidos podem ser recuperados. A validação usou uma carteira LNbits vazia para criar, listar e revogar ligações e completar uma troca NWC `get_info` assinada. Não foi enviado qualquer pagamento real. Servidores LNbits personalizados precisam de um adaptador de gestão compatível, portanto nem todos os serviços NWC oferecem necessariamente os mesmos controlos.

A versão 0.8.3 inclui as versões 0.8 anteriores. A [versão 0.8.0](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.0) restaurou a API experimental `window.nostr.wot` como opção explícita, desativada por predefinição, e adicionou sincronização limitada do grafo, avisos ao substituir listas de contactos e pontuação baseada em contas silenciadas. O GitHub fornece ficheiros ZIP para Chrome, Firefox e código-fonte com resumos SHA-256 registados. Estes downloads comprovam a distribuição pelo GitHub, não a publicação nas lojas. A listagem atual da Chrome foi verificada durante a recuperação, mas não permite reconstruir a versão disponível na loja no fecho de 25 de setembro. Não foi encontrada uma listagem correspondente no Firefox Add-ons, por isso esta edição não afirma disponibilidade nessa loja.

## Os pacotes do grafo chegam ao npm

O registo do npm mostra [`@nostr-wot/graph` 0.3.0](https://www.npmjs.com/package/@nostr-wot/graph) em 20 de setembro às 00:17 UTC e o pacote principal [`nostr-wot-sdk` 1.0.2](https://www.npmjs.com/package/nostr-wot-sdk) um minuto depois. A versão do grafo agrupa pesquisas em relés, adiciona um limite explícito de saltos, preserva versões determinísticas de eventos substituíveis e comprime listas de contactos persistidas. Também limita consultas de distância em lote e mantém escritas pendentes após uma falha de sincronização.

Há um limite de migração a planear: a base de dados do grafo passa para o esquema 2 do IndexedDB e versões anteriores do SDK não conseguem reabrir um espaço de nomes atualizado. Teste a atualização com um perfil descartável ou uma cache reconstruível antes de a aplicar a dados persistentes. A versão 0.3.1 surgiu às 10:47 UTC e é a versão mais recente do grafo no fecho desta edição. O respetivo registo de alterações descreve apenas documentação e afirma não haver mudanças em tempo de execução.

## Amber reduz o alcance de uma permissão sobre cópias de segurança

[Amber 6.6.5](https://github.com/greenart7c3/Amber/releases/tag/v6.6.5), publicada em 21 de setembro às 14:32 UTC, cifra cópias de segurança do assinante com uma chave dedicada derivada por HKDF fora do espaço de derivação NIP-44. Segundo as notas, isto impede que uma aplicação com permissão `nip44_decrypt` memorizada use essa permissão para ler conteúdos de cópias que incluem segredos NIP-46 por aplicação e chaves locais.

Cópias antigas cifradas com a chave de identidade ainda podem ser restauradas até uma publicação posterior as substituir. A versão fornece APKs Android e um manifesto de verificações assinado. Isso comprova artefactos disponíveis e um caminho de verificação, não a instalação num dispositivo específico nem a distribuição por todas as lojas. O projeto relata um limite corrigido, não um incidente explorado nem um número de utilizadores afetados.

## Uma verificação prática na atualização

Dê a cada aplicação de carteira uma ligação separada, com o menor limite diário útil e uma data de validade. Depois confirme que revogar uma não afeta as restantes. Para o SDK, teste a migração do esquema e a reconstrução da cache antes de usar o novo pacote do grafo com dados persistentes. Para Amber, verifique a versão instalada e publique uma cópia nova se depender de recuperação a partir de relés. Estas verificações reduzem o acesso partilhado e surpresas de formato sem tratar as notas de uma versão como prova de todas as instalações.
