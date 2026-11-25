Sistema de Gestão de Férias (Tema 17)

Plataforma corporativa de RH desenvolvida com NestJS/Prisma (Backend) e Next.js/TailwindCSS (Frontend).

📊 Diagrama Entidade-Relacionamento (DER)

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


🔄 Diagrama de Estados (Máquina de Estados)

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


🚀 Como Executar o Ambiente Locally

Backend (NestJS)

cd ppw_server
npm install
npx prisma generate
npm run start:dev


(Nota: mantenha o ppw_server configurado na porta 3001 para evitar conflito com a porta 8000 utilizada pelo GlitchTip).

Frontend (Next.js)

cd ppw_client
npm install
npm run dev


Observabilidade e Resiliência Visual (GlitchTip + Docker)

cd infra
docker compose up -d


Após iniciar o contêiner na porta 8000, acesse http://localhost:8000, entre no projeto e copie a DSN. Configure a variável NEXT_PUBLIC_SENTRY_DSN no arquivo ppw_client/.env.local e acesse http://localhost:3000/ticket/teste-erros para validar os Error Boundaries (src/app/ticket/error.tsx e src/app/global-error.tsx) e o envio de telemetria para o painel de Issues.

🛡️ Evidências de Resiliência e Monitoramento

docs/print1.png — Interface de fallback amigável do Error Boundary (error.tsx) com opção de recuperação via reset().

docs/print2.png — Painel Issues do GlitchTip registrando as exceções capturadas em tempo real.