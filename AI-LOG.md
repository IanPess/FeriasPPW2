# AI-LOG.md - Relatório Integral de Uso da IA e Reflexão Crítica

**Projeto:** Sistema Corporativo de Gestão e Aprovação de Férias (Tema 17)  
**Aluno:** Ian Pesquero Sales (`bi3041557`)  
**Disciplina:** Programação para Web II (PPW2) — IFSP Campus Birigui  
**Stack Tecnológica:** NestJS, Prisma ORM, PostgreSQL (Schema `bi3041557`), Next.js, TypeScript e Tailwind CSS  

---

## 1. Registro Cronológico Completo dos Prompts e Interações

A Inteligência Artificial (Gemini) foi utilizada como parceira de desenvolvimento, arquitetura e depuração ao longo de todo o ciclo de vida do sistema. Abaixo está o registro cronológico integral das perguntas, validações e refinamentos conduzidos pelo aluno:

### Fase 1: Arquitetura de Domínio, Máquina de Estados e Conceitos SOLID
- **Prompt 1:** *"Mecanismos para Inserir Complexidade Real quero que me explique com base no meu projeto."*
  - **Objetivo:** Compreender como transformar um CRUD básico em um motor corporativo com Máquina de Estados Finita, RBAC por estado e Guardas de Transição.
- **Prompt 2:** *"Com base nesse texto de apoio (Máquina de Estados Finita, Transições Restritas, RBAC, Concorrência, SLA, SOLID e Audit Log), me explique sobre o meu projeto, de forma que eu possa entender."*
  - **Objetivo:** Mapear cada requisito acadêmico diretamente para as entidades e fluxos do domínio de RH/Férias.
- **Prompt 3 (Síntese Crítica do Aluno):** *"Então basicamente estou protegendo as minhas rotas, em vez de rodar um insert para adicionar, ou um select, vou usar o POST, passando se for para aceitar e usando o id, ainda vou atribuir permissões para os usuários. Antes também de haver uma transição de dados, vou começar a passar por verificadores, e para que não aconteça de vir duas solicitações ao mesmo tempo eu adiciono o campo de versão, também adiciono o cancelamento parcial, para descontar apenas os dias que foram contados, mas não entendi qual princípio do SOLID vou aplicar, e seriam os três, não entendi a parte da rastreabilidade também e não entendi o ACID também."*
  - **Objetivo:** Validar o entendimento técnico sobre SRP, OCP, LSP, Audit Log imutável e atomicidade transacional.
- **Prompt 4 (Consolidação Conceitual):** *"Então o SRP, basicamente, cada classe ou módulo é responsável a uma mudança, não deixo tudo em um código só, o OCP garante que não precise alterar o código, apenas coloco uma validação nova se for necessário. Então o Liskov garante que a interface funcione com qualquer classe, independente de ser filha ou não. A rastreabilidade é importante pra caso tenha uma alteração fique registrado. O ACID ou faz ou não faz, garante também que seja válido e commit."*

### Fase 2: Modelagem Relacional e PostgreSQL Compartilhado
- **Prompt 5:** *"Esse é o meu schema.prisma atual, e agora? O que precisa mudar para se encaixar no projeto?"*
  - **Objetivo:** Identificar lacunas no schema inicial (ausência de `Role`, estados incompletos no enum `StatusFerias`, falta do campo `setor`, ausência da tabela `historico_solicitacoes` e falta do campo `version` para controle de concorrência).

### Fase 3: Implementação Backend (NestJS, SOLID e ACID)
- **Prompt 6:** *"Eu já tenho os arquivos, preciso saber o que teria que mudar para se encaixar no projeto (estrutura de pastas, guards, service e controller)?"*
  - **Objetivo:** Estruturar a pasta `src/module/ferias/guards/` e refatorar `ferias.service.ts`, `ferias.module.ts` e `ferias.controller.ts`.
- **Prompt 7:** *"Como o código da aplicação guarda os updates e o histórico de alterações no banco de dados sem sobrescrever?"*
  - **Objetivo:** Revisar o funcionamento interno do bloco `this.prisma.$transaction` aliado ao `Optimistic Locking` (`version`) e à gravação paralela na tabela `historico_solicitacoes`.

### Fase 4: Integração Frontend (Next.js) e Testes Ponta a Ponta
- **Prompt 8:** *"Cadastra e faz tudo perfeitamente, qual o próximo passo para exibir as ações e o modal de auditoria?"*
  - **Objetivo:** Implementar os botões de ação contextual (`Aprovar`, `Recusar`, `Cancelar Férias`) e o modal de visualização do Audit Log no frontend.
- **Prompt 9:** *"Preciso atualizar meu api.ts e page.tsx para integrar com as rotas PATCH e exibir o histórico."*
  - **Objetivo:** Tipar as requisições HTTP e tratar mensagens de exceção (`BadRequestException`) lançadas pelas guardas do backend.
- **Prompt 10:** *"Validação completa dos fluxos: trava de 5 dias da CLT, ciclo SOLICITADO → APROVADO → CANCELADO no Audit Log com estorno de saldo e bloqueio da cota de 20% do setor."*

### Fase 5: Versionamento Git e Documentação de Entrega
- **Prompt 11:** *"Como preparo esse meu arquivo para mandar para o professor? Lembro de ter algo de .gitignore, README.md com Mermaid e estrutura de commits."*

---

## 2. Análise Crítica e Refatorações de Código (IA vs. Implementação Final)

Abaixo estão documentadas as situações em que a proposta inicial da IA apresentou falhas de arquitetura, segurança ou incompatibilidade com o ambiente real, exigindo revisão crítica e refatoração manual pelo aluno.

### Caso 1: Incompatibilidade do Prisma Migrate com o PostgreSQL Compartilhado
- **Proposta Inicial da IA:** Executar `npx prisma migrate dev --name update_schema_vacation_rules` ou `npx prisma db push --force-reset` para recriar as tabelas automaticamente.
- **Problema Identificado pelo Aluno:** No servidor PostgreSQL compartilhado da faculdade, a conta do aluno (`bi3041557`) possui acesso restrito ao seu schema individual e não detém privilégios de `SUPERUSER` para criar bancos auxiliares (*shadow database*) ou executar resets destrutivos, resultando em erros de permissão (`permission denied`).
- **Refatoração Aplicada:** Substituição da migração automática pela execução controlada de scripts DDL/DML diretamente via DBeaver com definição explícita de contexto (`SET search_path TO bi3041557;`), seguida de `npx prisma generate` para atualizar a tipagem local do Prisma Client sem violar permissões do servidor.

### Caso 2: Acoplamento no Serviço Principal (Violação de SRP e OCP)
- **Proposta Inicial da IA:** Na primeira versão gerada, todas as regras de validação (mínimo de 5 dias corridos da CLT, saldo disponível do colaborador e cálculo do limite de 20% de ausência simultânea no setor) estavam concentradas em blocos `if/else` dentro do `FeriasService`.
- **Problema Identificado pelo Aluno:** Criação de uma *God Class* de difícil manutenção e testes. Qualquer nova regra solicitada pelo RH (como bloqueio de férias em meses de fechamento contábil) exigiria alterar diretamente o código principal da máquina de estados, violando o **Princípio Aberto/Fechado (OCP)** e o **Princípio da Responsabilidade Única (SRP)**.
- **Refatoração Aplicada (Código Real):** Desacoplamento total por meio da interface `TransitionGuard` (**LSP**) e criação de classes especialistas na pasta `src/module/ferias/guards/`:

```typescript
// ❌ Abordagem Inicial da IA (Acoplada no Service - Descartada)
if (dias < 5) throw new BadRequestException('Mínimo 5 dias');
const ausentes = await this.prisma.solicitacaoFerias.count(...);
if (ausentes >= limite) throw new BadRequestException('Limite atingido');

// ✅ Arquitetura Final Refatorada (SOLID - src/module/ferias/guards/transition-guard.interface.ts)
export interface TransitionGuard {
  validate(
    solicitacao: SolicitacaoFerias,
    funcionario: Funcionario,
    novasDatas?: { dataInicio: Date; diasSolicitados: number },
  ): Promise<void>;
}

// Implementações isoladas registradas no FeriasModule:
// 1. CltFractionGuard -> Valida fracionamento legal (>= 5 dias) e saldo suficiente
// 2. TeamCapacityGuard -> Consulta contagem no setor e bloqueia acima de 20% simultâneo
```

### Caso 3: Vulnerabilidade a Race Conditions (Concorrência Simultânea)
- **Proposta Inicial da IA:** As rotas de aprovação executavam atualizações simples filtrando apenas pela chave primária (`where: { id }`).
- **Problema Identificado pelo Aluno:** Em um setor com 5 colaboradores ativos (onde o limite de 20% permite apenas 1 ausente), se dois gestores aprovassem pedidos diferentes no mesmo milissegundo, ambas as consultas leriam `ausentesAprovados = 0` antes do commit, aprovando duas solicitações e estourando a capacidade do setor para 40%.
- **Refatoração Aplicada (Código Real):** Adição da coluna `version Int @default(0)` no modelo `SolicitacaoFerias` (`schema.prisma`) e aplicação de **Optimistic Locking** na query de atualização:

```typescript
// ✅ Controle de Concorrência (src/module/ferias/ferias.service.ts)
const solicitacaoAtualizada = await tx.solicitacaoFerias.update({
  where: { 
    id: solicitacao.id, 
    version: solicitacao.version // Bloqueia sobrescrita se outra transação alterou o registro antes
  },
  data: {
    status: StatusFerias.APROVADO,
    version: { increment: 1 },
  },
});
```

### Caso 4: Quebra de Atomicidade entre Mudança de Status e Audit Log
- **Proposta Inicial da IA:** Executar `await this.prisma.solicitacaoFerias.update(...)` e, em uma instrução separada fora de transação, executar `await this.prisma.historicoSolicitacao.create(...)`.
- **Problema Identificado pelo Aluno:** Quebra da propriedade de **Atomicidade (ACID)**. Se ocorresse uma falha de conexão ou erro de banco entre as duas instruções, o status mudaria para `APROVADO`, mas o registro na tabela `historico_solicitacoes` não seria criado, comprometendo a rastreabilidade.
- **Refatoração Aplicada:** Encapsulamento obrigatório de todas as operações críticas dentro de `this.prisma.$transaction(async (tx) => { ... })`. Assim, a atualização do status, o incremento da versão, o desconto/estorno do saldo do colaborador e a gravação do log de auditoria ocorrem de forma atômica ("tudo ou nada").

### Caso 5: Inconsistência de Saldo no Cancelamento de Férias Aprovadas
- **Proposta Inicial da IA:** O endpoint `PATCH /ferias/:id/cancelar` apenas alterava o campo `status` para `CANCELADO`.
- **Problema Identificado pelo Aluno:** Quando uma solicitação já aprovada era cancelada antes do início do gozo, os dias anteriormente deduzidos permaneciam descontados do colaborador.
- **Refatoração Aplicada (Código Real):** Inclusão da regra de estorno automático dentro da transação de cancelamento:

```typescript
// ✅ Rollback de Domínio no Cancelamento (src/module/ferias/ferias.service.ts)
if (estadoAnterior === StatusFerias.APROVADO) {
  await tx.funcionario.update({
    where: { id: solicitacao.funcionarioId },
    data: {
      saldoDias: solicitacao.funcionario.saldoDias + solicitacao.diasSolicitados,
    },
  });
}
```

### Caso 6: Tipagem de Endpoints e Visualização do Audit Log no Frontend
- **Proposta Inicial da IA:** Chamadas `fetch` diretas e genéricas dentro dos componentes React sem tipagem dos corpos das requisições `PATCH` nem exibição estruturada do histórico.
- **Problema Identificado pelo Aluno:** Falta de padronização no envio de `justificativa` e `motivoRecusa` para o Audit Log e dificuldade para exibir ao usuário os alertas específicos lançados pelas guardas do NestJS.
- **Refatoração Aplicada:** Centralização da camada de comunicação em `ppw_client/src/lib/api.ts` com funções tipadas (`aprovarFerias`, `rejeitarFerias`, `cancelarFerias`) capturando `errorData.message` da API, e implementação do modal de auditoria em `ppw_client/src/app/page.tsx` exibindo `estadoAnterior → novoEstado`, autor, justificativa e timestamp.

---

## 3. Matriz de Validação dos Requisitos (Testes Executados)

Todos os fluxos foram validados em ambiente integrado (Next.js $\leftrightarrow$ NestJS $\leftrightarrow$ PostgreSQL `bi3041557`):

| Cenário de Teste | Regra / Mecanismo Validado | Comportamento Observado | Status |
| :--- | :--- | :--- | :---: |
| Solicitar férias com menos de 5 dias | `CltFractionGuard` (SRP / LSP) | Backend rejeita com HTTP 400: *"Segundo a CLT, nenhum período de férias pode ser inferior a 5 dias corridos."* | ✅ Validado |
| Aprovar solicitação de 17 dias | Transação ACID + Lock Otimista | Status alterado para `APROVADO`, saldo reduzido de 30 para 13 dias e `version` incrementada. | ✅ Validado |
| Cancelar solicitação já aprovada | Estorno de Saldo + Audit Log | Status alterado para `CANCELADO`, saldo restaurado para 30 dias e transição `APROVADO → CANCELADO` registrada. | ✅ Validado |
| 5 colaboradores no setor "Geral" | `TeamCapacityGuard` (Limite 20%) | 1ª aprovação efetivada (20%). 2ª aprovação na mesma janela de datas bloqueada pela guarda de capacidade. | ✅ Validado |
| Auditoria de ciclo de vida | Tabela `historico_solicitacoes` | Modal exibe cronologia imutável com estado anterior, novo estado, autor, data/hora e justificativa. | ✅ Validado |

---

## 4. Documentação Complementar
O histórico completo das interações e especificações técnicas detalhadas também está consolidado no documento `docs/PPW2.pdf` neste repositório.
