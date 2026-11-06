import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  // Cadastrar novo funcionário
  async create(data: CreateFuncionarioDto) {
    return this.prisma.funcionario.create({
      data: {
        nome: data.nome,
        email: data.email,
        cargo: data.cargo,
        dataAdmissao: new Date(data.dataAdmissao),
        saldoDias: data.saldoDias ?? 30,
        gestorId: data.gestorId || null,
      },
    });
  }

  // Listar todos os funcionários ativos
  async findAll() {
    return this.prisma.funcionario.findMany({
      where: { status: 'ATIVO' },
      include: { gestor: true },
    });
  }

  // Alterar dados do funcionário
  async update(id: string, data: Partial<CreateFuncionarioDto>) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id } });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    return this.prisma.funcionario.update({
      where: { id },
      data: {
        nome: data.nome,
        email: data.email,
        cargo: data.cargo,
        dataAdmissao: data.dataAdmissao ? new Date(data.dataAdmissao) : undefined,
        saldoDias: data.saldoDias,
        gestorId: data.gestorId !== undefined ? (data.gestorId || null) : undefined,
      },
    });
  }

  // Desativar funcionário (Soft Delete - sem excluir do banco)
  async desativar(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id } });
    if (!funcionario) throw new NotFoundException('Funcionário não encontrado');

    return this.prisma.funcionario.update({
      where: { id },
      data: { status: 'INATIVO' },
    });
  }
}