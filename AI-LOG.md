# AI-LOG.md - Relatório de Uso da IA e Reflexão Crítica

## 1. Visão Geral e Registro de Interações Principais
Durante a construção do projeto acadêmico de **Aprovação de Férias (Tema 17)**, a Inteligência Artificial foi utilizada como ferramenta de consulta, pair-programming e apoio no design de arquitetura. O desenvolvimento abrangeu a criação da API no backend com **NestJS**, a persistência de dados via **Prisma ORM** integrada ao banco PostgreSQL compartilhado (`bi3041557`), e o desenvolvimento do frontend reativo em **Next.js**.

As consultas à IA focaram em:
1. Modelagem da **Máquina de Estados Finita** para a entidade de solicitações de férias.
2. Implementação das regras de negócio complexas sob o padrão **SOLID**.
3. Garantia de **Integridade ACID**, controle de concorrência (**Optimistic Lock**) e **Rastreabilidade (Audit Log)**.
4. Resolução de bugs de infraestrutura de banco de dados e sincronização do frontend com a API.

---

## 2. Análise Crítica e Refatorações de Código (AI vs. Implementação Final)

### Caso 1: Gestão de Schemas no PostgreSQL Compartilhado da Faculdade
- **Prompt Original / Sugestão da IA:** A IA sugeriu comandos padrão de CLI do Prisma, como `npx prisma db push --force-reset` e `npx prisma migrate dev`, para recriar as tabelas no banco de dados.
- **Falha/Problema Identificado:** No ambiente acadêmico compartilhada do PostgreSQL, a conta de usuário (`bi3041557`) não possui permissões de `SUPERUSER` nem acesso para criar/deletar schemas inteiros. Executar os comandos automáticos causava erros de permissão de sistema (`permission denied`) ou tentava apagar schemas alheios.
- **Refatoração Aplicada:** A lógica gerada pela IA foi corrigida para a execução direta de Scripts DDL/DML via DBeaver, configurando o caminho explícito `SET search_path TO bi3041557;` antes da criação de `ENUMS`, tabelas e chaves estrangeiras.

### Caso 2: Arquitetura SOLID e Isolamento das Guardas de Negócio
- **Prompt Original / Sugestão da IA:** Na primeira versão do serviço (`ferias.service.ts`), a IA concentrou todas as validações de negócio (mínimo de dias da CLT, saldo do funcionário e teto de ausência da equipe) diretamente no corpo do método `aprovar()` ou `solicitar()`.
- **Falha/Problema Identificado:** Violação grave do **SRP (Single Responsibility Principle)**, gerando uma classe de serviço gigante ("God Class"), e do **OCP (Open/Closed Principle)**, pois qualquer nova regra de RH exigiria modificar e arriscar quebrar o código core do serviço.
- **Refatoração Aplicada:**
  - **LSP (Liskov Substitution):** Criação da interface contrato `TransitionGuard` no diretório `guards/`.
  - **SRP / OCP:** Criação de classes isoladas `CltFractionGuard` (validação de fracionamento legal e saldo mínimo de 5 dias corridos) e `TeamCapacityGuard` (consulta do limite de 20% de ausências simultâneas por setor). O `FeriasService` passou apenas a injetar e iterar sobre as guardas.

### Caso 3: Tratamento de Concorrência e Race Conditions (Lock Otimista)
- **Prompt Original / Sugestão da IA:** As propostas iniciais de endpoints executavam atualizações diretas no banco de dados (`UPDATE solicitacoes SET status = 'APROVADO' WHERE id = ...`).
- **Falha/Problema Identificado:** Vulnerabilidade a requisições concorrentes. Se dois gestores tentassem aprovar solicitações de colaboradores do mesmo setor no mesmo milissegundo, ambos passavam na validação dos 20%, resultando na extrapolação do limite permitido da equipe.
- **Refatoração Aplicada:** Adição da coluna `version` (`Int @default(0)`) no `schema.prisma`. O update no NestJS foi modificado para filtrar obrigatoriamente por `{ id, version }` e incrementar a versão (`version: { increment: 1 }`). Se o estado/versão mudar durante o processo, a query bloqueia a sobrescrita inconsistente.

### Caso 4: Transações ACID e Rastreabilidade Imutável (Audit Log)
- **Prompt Original / Sugestão da IA:** A IA propôs atualizar o status da solicitação primeiro e, em uma instrução separada fora do contexto transacional, criar o registro de histórico de auditoria.
- **Falha/Problema Identificado:** Ausência da propriedade de **Atomicidade (A do ACID)**. Se ocorresse uma falha de rede ou queda no banco de dados exatamente entre a atualização e o log, o estado da solicitação mudava, mas a trilha de auditoria era perdida.
- **Refatoração Aplicada:** Encapsulamento de toda a transição de estado dentro do bloco `this.prisma.$transaction(async (tx) => { ... })`. O desconto do saldo de dias do colaborador, o incremento da `version`, a atualização do `status` e a inserção na tabela `historico_solicitacoes` (com `estadoAnterior`, `novoEstado`, `autorId`, `justificativa` e `timestamp`) acontecem juntos. Se uma etapa falha, todo o bloco sofre `ROLLBACK`.

### Caso 5: Regra de Negócio de Cancelamento (Rollback de Saldo)
- **Prompt Original / Sugestão da IA:** Inicialmente a IA implementou o cancelamento apenas alterando o status para `CANCELADO`.
- **Falha/Problema Identificado:** O cancelamento de férias já aprovadas deixava o saldo de dias do colaborador indevidamente descontado, além de manter a cota de 20% da equipe travada.
- **Refatoração Aplicada:** Ajuste no método `cancelar()` para verificar o `estadoAnterior`. Se a solicitação já estivesse em estado `APROVADO`, a transação ACID realiza o estorno automático dos dias devolvendo-os ao `saldoDias` do colaborador na tabela `funcionarios`, além de registrar o evento no log de auditoria.

### Caso 6: Integração da API ao Frontend (Next.js & API Client)
- **Prompt Original / Sugestão da IA:** A IA gerou exemplos genéricos de formulário em React sem mapear as assinaturas corretas dos DTOs nem os corpos das requisições `PATCH`.
- **Falha/Problema Identificado:** Erros de tipo no TypeScript ao chamar `aprovarFerias` e `rejeitarFerias` a partir da interface web, além da ausência do envio de justificativa e autor para o Audit Log.
- **Refatoração Aplicada:** Atualização completa do módulo `@/lib/api.ts` e do componente `page.tsx`, adicionando o mapeamento das rotas `PATCH` (`/ferias/:id/aprovar`, `/ferias/:id/rejeitar`, `/ferias/:id/cancelar`), suporte ao envio de corpo JSON com `justificativa` e `motivoRecusa`, e renderização dinâmica do modal de **Histórico de Auditoria** para exibição em tempo real das transições.

---

## 3. Conclusão e Registro de Apoio
A utilização da IA acelerou a estruturação do código base, mas exigiu **revisão crítica contínua** para garantir conformidade com os princípios SOLID, segurança transacional no PostgreSQL e alinhamento com todas as exigências do trabalho avaliativo.

O registro completo contendo as trocas de dados, transcrição detalhada de testes e diagramas de modelagem encontra-se exportado no arquivo de apoio `PPW2.pdf` na pasta `docs/`.
