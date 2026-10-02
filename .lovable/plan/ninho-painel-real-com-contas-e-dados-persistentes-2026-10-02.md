# Ninho: painel real com contas e dados persistentes

## Objetivo
Transformar o protótipo atual em um painel funcional para responsáveis, com contas, dispositivos vinculados, fila de comandos, telemetria e histórico persistentes. Nesta etapa, será entregue o painel e o banco; a integração nativa será feita quando o projeto Android for enviado.

## O que será construído
- Ativar acesso por e-mail/senha e Google, incluindo cadastro, entrada, saída e recuperação de senha.
- Criar perfil completo do responsável: nome, telefone, foto e preferências.
- Proteger o painel para que cada responsável veja somente seus próprios dispositivos, comandos e registros.
- Criar cadastro e pareamento de dispositivos supervisionados, com nome, plataforma, estado de conexão e última atividade.
- Criar uma fila real de comandos com estados pendente, executando, concluído, recusado e falhou.
- Persistir telemetria de localização e registros de mídia, com arquivos em armazenamento privado.
- Atualizar o painel em tempo real quando o dispositivo responder ou enviar nova telemetria.
- Substituir os dados demonstrativos do painel por dados reais, mantendo estados vazios e mensagens de erro claras.
- Manter uma visão de simulação do aparelho supervisionado para testar o fluxo enquanto o aplicativo Android não é enviado.

## Privacidade e segurança
- Câmera, captura/gravação de tela e áudio exigirão aviso visível e consentimento explícito no aparelho supervisionado em cada solicitação.
- O painel mostrará quem solicitou, quando solicitou e o resultado da autorização.
- Localização e estado básico do aparelho poderão seguir a política de supervisão aceita no pareamento.
- Arquivos de mídia serão privados e acessíveis apenas ao responsável vinculado.
- Não será implementada captura silenciosa ou escondida, mesmo em aparelho de menor de idade.

## Estrutura dos dados
- Perfis dos responsáveis.
- Dispositivos vinculados ao responsável.
- Comandos remotos, incluindo localização, foto, tela, gravação de tela e áudio.
- Telemetria e referências de arquivos privados.
- Registro de consentimento e auditoria por comando.

## Etapa Android posterior
Quando o projeto Android for enviado, integrar:
- pareamento seguro do aparelho;
- escuta da fila de comandos;
- serviço em primeiro plano com indicador persistente;
- permissões nativas e tela de consentimento;
- envio de resultados e atualização do status dos comandos.

## Verificação
- Confirmar isolamento dos dados entre responsáveis.
- Testar cadastro e entrada pelos dois métodos.
- Testar criação e mudança de estado dos comandos.
- Testar atualização em tempo real e acesso privado às mídias.
- Validar o painel em telas grandes e celulares.
