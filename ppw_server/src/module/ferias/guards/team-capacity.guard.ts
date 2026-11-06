import { BadRequestException, Injectable } from '@nestjs/common';
import { TransitionGuard } from './transition-guard.interface';
import { SolicitacaoFerias, Funcionario, StatusFerias } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service'; // Ajusta o caminho se o teu PrismaService estiver noutro sítio

@Injectable()
export class TeamCapacityGuard implements TransitionGuard {
  constructor(private readonly prisma: PrismaService) {}

  async validate(
    solicitacao: SolicitacaoFerias,
    funcionario: Funcionario,
  ): Promise<void> {
    // 1. Obter total de colaboradores ativos no mesmo setor
    const totalSetor = await this.prisma.funcionario.count({
      where: {
        setor: funcionario.setor,
        status: 'ATIVO',
      },
    });

    if (totalSetor === 0) return;

    // 2. Data final das férias solicitadas
    const inicioSolicitado = new Date(solicitacao.dataInicio);
    const fimSolicitado = new Date(inicioSolicitado);
    fimSolicitado.setDate(fimSolicitado.getDate() + solicitacao.diasSolicitados);

    // 3. Contar ausências já aprovadas no mesmo setor e período
    const ausentesAprovados = await this.prisma.solicitacaoFerias.count({
      where: {
        status: StatusFerias.APROVADO,
        funcionario: { setor: funcionario.setor },
        id: { not: solicitacao.id },
        AND: [
          { dataInicio: { lte: fimSolicitado } },
        ],
      },
    });

    // 4. Regra dos 20% (máximo permitido)
    const limitePermitido = Math.max(1, Math.floor(totalSetor * 0.2));

    if (ausentesAprovados >= limitePermitido) {
      throw new BadRequestException(
        `Limite do setor atingido: O setor '${funcionario.setor}' já tem o limite de ${limitePermitido} colaborador(es) (20%) ausente(s) no período selecionado.`,
      );
    }
  }
}