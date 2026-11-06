import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StatusFerias } from '@prisma/client';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';
import { CltFractionGuard } from './guards/clt-fraction.guard';
import { TeamCapacityGuard } from './guards/team-capacity.guard';

@Injectable()
export class FeriasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cltGuard: CltFractionGuard,
    private readonly teamCapacityGuard: TeamCapacityGuard,
  ) {}

  // 1. Criar Solicitação de Férias (Com Guarda da CLT e Inicialização no estado RASCUNHO/SOLICITADO)
  async solicitar(dto: CriarSolicitacaoDto) {
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { id: dto.funcionarioId },
    });

    if (!funcionario || funcionario.status !== 'ATIVO') {
      throw new NotFoundException('Funcionário não encontrado ou inativo.');
    }

    // Executa a Guarda da CLT para validar fracionamento e saldo
    await this.cltGuard.validate(
      { diasSolicitados: dto.diasSolicitados } as any,
      funcionario,
      { dataInicio: new Date(dto.dataInicio), diasSolicitados: dto.diasSolicitados },
    );

    return this.prisma.solicitacaoFerias.create({
      data: {
        funcionarioId: dto.funcionarioId,
        dataInicio: new Date(dto.dataInicio),
        diasSolicitados: dto.diasSolicitados,
        abonoPecuniario: dto.abonoPecuniario ?? false,
        status: StatusFerias.SOLICITADO,
      },
    });
  }

  // 2. Listar todas as solicitações (com funcionário e histórico de auditoria)
  async findAll() {
    return this.prisma.solicitacaoFerias.findMany({
      include: {
        funcionario: true,
        historicos: {
          include: { autor: true },
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  // 3. Aprovar Solicitação (Transação ACID + Guarda dos 20% + Lock por Versão + Audit Log)
  async aprovar(id: string, autorId?: string, justificativa?: string) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacaoFerias.findUnique({
        where: { id },
        include: { funcionario: true },
      });

      if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.');

      if (
        solicitacao.status !== StatusFerias.SOLICITADO &&
        solicitacao.status !== StatusFerias.EM_ANALISE
      ) {
        throw new BadRequestException(
          `Esta solicitação não pode ser aprovada no estado atual (${solicitacao.status}).`,
        );
      }

      // Executa a Guarda dos 20% da equipe no mesmo setor
      await this.teamCapacityGuard.validate(solicitacao, solicitacao.funcionario);

      // Desconta o saldo do funcionário
      await tx.funcionario.update({
        where: { id: solicitacao.funcionarioId },
        data: {
          saldoDias: solicitacao.funcionario.saldoDias - solicitacao.diasSolicitados,
        },
      });

      // Atualiza estado + incrementa version (Lock Otimista)
      const solicitacaoAtualizada = await tx.solicitacaoFerias.update({
        where: { id, version: solicitacao.version },
        data: {
          status: StatusFerias.APROVADO,
          version: { increment: 1 },
        },
      });

      // Se um autorId for fornecido (ex: gestor logado), registra o log de auditoria
      const gestorExecutivoId = autorId || solicitacao.funcionario.gestorId || solicitacao.funcionarioId;

      await tx.historicoSolicitacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          estadoAnterior: solicitacao.status,
          novoEstado: StatusFerias.APROVADO,
          autorId: gestorExecutivoId,
          justificativa: justificativa || 'Solicitação de férias aprovada.',
        },
      });

      return solicitacaoAtualizada;
    });
  }

  // 4. Rejeitar / Recusar Solicitação (Transação ACID + Audit Log + Motivo)
  async rejeitar(id: string, autorId?: string, motivoRecusa?: string) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacaoFerias.findUnique({
        where: { id },
        include: { funcionario: true },
      });

      if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.');

      if (
        solicitacao.status === StatusFerias.APROVADO ||
        solicitacao.status === StatusFerias.RECUSADO ||
        solicitacao.status === StatusFerias.CANCELADO
      ) {
        throw new BadRequestException(`A solicitação já está no estado final ${solicitacao.status}.`);
      }

      const solicitacaoRecusada = await tx.solicitacaoFerias.update({
        where: { id, version: solicitacao.version },
        data: {
          status: StatusFerias.RECUSADO,
          motivoRecusa: motivoRecusa || 'Solicitação recusada pela gestão.',
          version: { increment: 1 },
        },
      });

      const gestorExecutivoId = autorId || solicitacao.funcionario.gestorId || solicitacao.funcionarioId;

      await tx.historicoSolicitacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          estadoAnterior: solicitacao.status,
          novoEstado: StatusFerias.RECUSADO,
          autorId: gestorExecutivoId,
          justificativa: motivoRecusa || 'Solicitação recusada.',
        },
      });

      return solicitacaoRecusada;
    });
  }

  // 5. Cancelar Solicitação (Restaura o saldo caso já estivesse APROVADO)
  async cancelar(id: string, autorId?: string, justificativa?: string) {
    return this.prisma.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacaoFerias.findUnique({
        where: { id },
        include: { funcionario: true },
      });

      if (!solicitacao) throw new NotFoundException('Solicitação não encontrada.');

      const estadoAnterior = solicitacao.status;

      // Se já estava aprovado, devolve os dias ao saldo do colaborador
      if (estadoAnterior === StatusFerias.APROVADO) {
        await tx.funcionario.update({
          where: { id: solicitacao.funcionarioId },
          data: {
            saldoDias: solicitacao.funcionario.saldoDias + solicitacao.diasSolicitados,
          },
        });
      }

      const solicitacaoCancelada = await tx.solicitacaoFerias.update({
        where: { id, version: solicitacao.version },
        data: {
          status: StatusFerias.CANCELADO,
          version: { increment: 1 },
        },
      });

      const executorId = autorId || solicitacao.funcionarioId;

      await tx.historicoSolicitacao.create({
        data: {
          solicitacaoId: solicitacao.id,
          estadoAnterior: estadoAnterior,
          novoEstado: StatusFerias.CANCELADO,
          autorId: executorId,
          justificativa: justificativa || 'Solicitação de férias cancelada.',
        },
      });

      return solicitacaoCancelada;
    });
  }
}