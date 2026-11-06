-- CreateEnum
CREATE TYPE "StatusFuncionario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusFerias" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'PAGO');

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "data_admissao" TIMESTAMP(3) NOT NULL,
    "saldo_dias" INTEGER NOT NULL DEFAULT 30,
    "status" "StatusFuncionario" NOT NULL DEFAULT 'ATIVO',
    "gestor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_ferias" (
    "id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "dias_solicitados" INTEGER NOT NULL,
    "abono_pecuniario" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusFerias" NOT NULL DEFAULT 'PENDENTE',
    "motivo_recusa" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_ferias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "funcionarios"("email");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_gestor_id_fkey" FOREIGN KEY ("gestor_id") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_ferias" ADD CONSTRAINT "solicitacoes_ferias_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "funcionarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
