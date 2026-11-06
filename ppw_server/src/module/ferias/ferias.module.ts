import { Module } from '@nestjs/common';
import { FeriasController } from './ferias.controller';
import { FeriasService } from './ferias.service';
import { PrismaModule } from '../../database/prisma.module';
import { CltFractionGuard } from './guards/clt-fraction.guard';
import { TeamCapacityGuard } from './guards/team-capacity.guard';

@Module({
  imports: [PrismaModule],
  controllers: [FeriasController],
  providers: [
    FeriasService,
    CltFractionGuard,
    TeamCapacityGuard,
  ],
})
export class FeriasModule {}