import { SolicitacaoFerias, Funcionario } from '@prisma/client';

export interface TransitionGuard {
  validate(
    solicitacao: SolicitacaoFerias,
    funcionario: Funcionario,
    novasDatas?: { dataInicio: Date; diasSolicitados: number },
  ): Promise<void>;
}