---
issue: "2026-10-23"
locale: "pt"
status: "prepared"
subject: "Extension 0.8.17 melhora passkeys e assinatura local"
preheader: "Pacotes de navegador verificados de 16 a 23 de outubro e o limite exato do SDK."
coverageStart: "2026-10-16T08:00:00Z"
coverageEnd: "2026-10-23T08:00:00Z"
timezone: "Europe/Zurich"
---

## Cinco versões verificadas da extensão

A Nostr WoT Extension publicou as versões [0.8.13](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.13) até [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) durante a janela desta edição. Cada versão no GitHub inclui pacotes separados para Chrome e Firefox, código-fonte reproduzível, somas SHA-256 e horário de publicação não preliminar. As lojas do Chrome e Firefox mostravam a 0.8.17 como versão atual em 23 de outubro.

A versão 0.8.13 adiciona criação e recuperação de cofre protegido por passkey, arquivos de recuperação criptografados, recuperação explícita por relés e um explorador de arquivo. Provedor, arquivo e relé são opções distintas. A confirmação de um relé não prova que outro dispositivo consegue recuperar a conta, portanto preserve o arquivo criptografado e teste o caminho escolhido.

## A assinatura pelo telefone continua experimental

A versão [0.8.14](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.14) adiciona uma ponte local experimental para uma versão compatível do Nostr WoT no telefone por Wi-Fi, ou Bluetooth quando o navegador oferece Web Bluetooth. O pareamento usa um código correspondente. O computador recebe uma conta Network temporária e envia ao telefone as aprovações de assinatura ou criptografia.

A ponte aceita assinatura NIP-07 e criptografia clássica NIP-04 e NIP-44. Operações de identidade da carteira, publicação interna e operações pós-quânticas ficam indisponíveis enquanto a assinatura pelo telefone estiver selecionada. Fechar a ponte remove a conta temporária e um telefone desconectado nunca usa chaves locais como alternativa. Pareamento por som não está disponível nesta versão.

## Dados, moedas e permissões mais claras

A versão [0.8.15](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.15) adiciona um fluxo de frase de recuperação verificável offline, usando 256 lançamentos de moeda como bits diretos ou entradas de dados processadas com SHA-256. A aba separada registra as entradas, mas não mostra a frase resultante. A versão também reúne chaves pós-quânticas, Web of Trust e a ponte local em Experimental, permite nomear contas sem rótulo e impede que relés inacessíveis bloqueiem indefinidamente a integração.

A versão [0.8.16](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.16) reduz pedidos repetidos de autenticação em relés. Uma escolha explícita Always pode cobrir todas as solicitações pendentes para o site selecionado ou todos os sites conectados. As permissões continuam visíveis e revogáveis em Permissions, por isso o acesso amplo deve ser revisto depois do uso.

A versão [0.8.17](https://github.com/nostr-wot/nostr-wot-extension/releases/tag/v0.8.17) mantém o assistente de passkey aberto enquanto a primeira conta é salva e reutiliza a verificação recente para a escolha inicial de bloqueio automático. A autorização de uso único expira após cinco minutos e é revogada por bloqueio, troca de conta ou nova autenticação.

## Limite da versão e verificação antes de atualizar

Nenhum novo pacote do SDK foi publicado antes do corte de 23 de outubro às 08:00 UTC. nostr-wot-sdk 2.0.0 permaneceu como a versão mais recente verificada dentro da janela. A solicitação do SDK 3.0.1 só foi integrada às 20:21 UTC daquele dia, por isso pertence à próxima edição.

Antes de atualizar, escolha o pacote do navegador correto, compare o SHA-256 com as somas da versão e mantenha um método de recuperação funcional. Trate a ponte do telefone como experimental, revise permissões lembradas de relé e confirme a recuperação por passkey em um segundo dispositivo compatível antes de depender dela.
