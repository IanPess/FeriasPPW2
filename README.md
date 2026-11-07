# Sistema de Gestão de Férias (Tema 17)

Plataforma corporativa de RH desenvolvida com NestJS/Prisma (Backend) e Next.js/TailwindCSS (Frontend).

## 📊 Diagrama Entidade-Relacionamento (DER)

```mermaid
erDiagram
    FUNCIONARIOS ||--o{ SOLICITACOES_FERIAS : solicita
    FUNCIONARIOS ||--o{ HISTORICO_SOLICITACOES : executa
    SOLICITACOES_FERIAS ||--o{ HISTORICO_SOLICITACOES : possui

    FUNCIONARIOS {
        string id PK
        string nome
        string email UK
        string cargo
        Role role
        string setor
        datetime data_admissao
        int saldo_dias
        StatusFuncionario status
        string gestor_id FK
    }

    SOLICITACOES_FERIAS {
        string id PK
        string funcionario_id FK
        datetime data_inicio
        int dias_solicitados
        boolean abono_pecuniario
        StatusFerias status
        string motivo_recusa
        int version
    }

    HISTORICO_SOLICITACOES {
        string id PK
        string solicitacao_id FK
        StatusFerias estado_anterior
        StatusFerias novo_estado
        string autor_id FK
        string justificativa
        datetime timestamp
    }
```

## 🔄 Diagrama de Estados (Máquina de Estados)

```mermaid
stateDiagram-v2
    [*] --> RASCUNHO
    RASCUNHO --> SOLICITADO: Enviar Solicitação
    SOLICITADO --> EM_ANALISE: Iniciar Análise
    EM_ANALISE --> APROVADO: Guardas Válidas (CLT / 20% Setor)
    EM_ANALISE --> RECUSADO: Limite Excedido ou Negado
    SOLICITADO --> APROVADO: Aprovação Direta
    SOLICITADO --> RECUSADO: Recusa Direta
    APROVADO --> CANCELADO: Cancelar (Restaura Saldo)
    RECUSADO --> [*]
    CANCELADO --> [*]
```

## 🚀 Como Executar o Ambiente Locally

### Backend (NestJS)
```bash
cd ppw_server
npm install
npx prisma generate
npm run start:dev
```

### Frontend (Next.js)
```bash
cd ppw_client
npm install
npm run dev
```
