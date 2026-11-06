import { BadRequestException, Injectable } from '@nestjs/common';
import { TransitionGuard } from './transition-guard.interface';
import { SolicitacaoFerias, Funcionario } from '@prisma/client';

@Injectable()
export class CltFractionGuard implements TransitionGuard {
  async validate(
    solicitacao: SolicitacaoFerias,
    funcionario: Funcionario,
    novasDatas?: { dataInicio: Date; diasSolicitados: number },
  ): Promise<void> {
    const dias = novasDatas ? novasDatas.diasSolicitados : solicitacao.diasSolicitados;

    if (dias < 5) {
      throw new BadRequestException(
        'Segundo a CLT, nenhum período de férias pode ser inferior a 5 dias corridos.',
      );
    }

    if (funcionario.saldoDias - dias < 0) {
      throw new BadRequestException(
        `Saldo insuficiente. O colaborador tem apenas ${funcionario.saldoDias} dias disponíveis.`,
      );
    }
  }
}