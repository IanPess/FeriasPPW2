import { Module } from '@nestjs/common';
import { FuncionariosController } from './funcionarios.controller';
import { FuncionariosService } from './funcionarios.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FuncionariosController],
  providers: [FuncionariosService],
  exports: [FuncionariosService],
})
export class FuncionariosModule {}