import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { FeriasService } from './ferias.service';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto';

@Controller('ferias')
export class FeriasController {
  constructor(private readonly feriasService: FeriasService) {}

  @Post()
  solicitar(@Body() dto: CriarSolicitacaoDto) {
    return this.feriasService.solicitar(dto);
  }

  @Get()
  findAll() {
    return this.feriasService.findAll();
  }

  @Patch(':id/aprovar')
  aprovar(
    @Param('id') id: string,
    @Body('autorId') autorId?: string,
    @Body('justificativa') justificativa?: string,
  ) {
    return this.feriasService.aprovar(id, autorId, justificativa);
  }

  @Patch(':id/rejeitar')
  rejeitar(
    @Param('id') id: string,
    @Body('autorId') autorId?: string,
    @Body('motivoRecusa') motivoRecusa?: string,
  ) {
    return this.feriasService.rejeitar(id, autorId, motivoRecusa);
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id') id: string,
    @Body('autorId') autorId?: string,
    @Body('justificativa') justificativa?: string,
  ) {
    return this.feriasService.cancelar(id, autorId, justificativa);
  }
}