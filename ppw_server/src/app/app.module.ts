import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { FuncionariosModule } from '../module/funcionarios/funcionarios.module';
import { FeriasModule } from '../module/ferias/ferias.module';

const modules = [
  PrismaModule,
  FuncionariosModule,
  FeriasModule,
];

@Module({
  imports: [...modules],
  controllers: [],
  providers: [],
})
export class AppModule {}