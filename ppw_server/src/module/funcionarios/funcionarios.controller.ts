import { Controller, Post, Get, Put, Patch, Body, Param } from '@nestjs/common';
import { FuncionariosService } from './funcionarios.service';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';

@Controller('funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  @Post()
  create(@Body() dto: CreateFuncionarioDto) {
    return this.funcionariosService.create(dto);
  }

  @Get()
  findAll() {
    return this.funcionariosService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateFuncionarioDto>) {
    return this.funcionariosService.update(id, dto);
  }

  @Patch(':id/desativar')
  desativar(@Param('id') id: string) {
    return this.funcionariosService.desativar(id);
  }
}