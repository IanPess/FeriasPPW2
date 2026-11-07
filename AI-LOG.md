# AI-LOG.md - Relatório de Uso da IA e Reflexão Crítica

## 1. Registro de Consultas e Prompts Principais
Durante o desenvolvimento do Tema 17 (Aprovação de Férias), a IA foi utilizada como parceira de apoio para a modelagem da máquina de estados, transações ACID e guardas SOLID.

---

## 2. Análise Crítica e Correções efetuadas no Código da IA

### Caso 1: Tratamento de Concorrência e Lock Otimista
- **Proposta Inicial da IA:** A IA sugeriu rotas diretas de `UPDATE` na tabela de solicitações sem verificação de versão.
- **Problema Identificado pelo Aluno:** Em acessos simultâneos (ex: dois gestores aprovando ao mesmo tempo), a cota de 20% do setor poderia ser estourada por race condition.
- **Refatoração Aplicada:** Adição da coluna `version` (`Optimistic Lock`) e controle estrito dentro do bloco transacional.

### Caso 2: Permissões de Schema no PostgreSQL Compartilhado
- **Proposta Inicial da IA:** Uso de comandos automáticos de migração (`npx prisma db push --force-reset`).
- **Problema Identificado pelo Aluno:** O usuário do banco da faculdade (`bi3041557`) não possui privilégios de superuser para recriar o schema.
- **Refatoração Aplicada:** Alteração do fluxo para execução de scripts SQL diretos no DBeaver com `SET search_path TO bi3041557;`.

### Caso 3: Princípios SOLID e Guardas Desacopladas
- **Proposta Inicial da IA:** Colocar as regras de validação (CLT e 20% do setor) todas juntas dentro da classe do `FeriasService`.
- **Problema Identificado pelo Aluno:** Violação dos princípios SRP (Single Responsibility) e OCP (Open/Closed).
- **Refatoração Aplicada:** Criação da interface `TransitionGuard` (LSP) e isolamento em `CltFractionGuard` e `TeamCapacityGuard`.

---

## 3. Histórico Completo em PDF
O log completo contendo os diálogos de apoio e estudos do projeto foi exportado e mantido no arquivo de apoio `PPW2.pdf` para consulta na arguição técnica.
