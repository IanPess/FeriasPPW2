import 'dotenv/config'; // <-- Adicione esta linha no topo
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL não foi encontrada no arquivo .env');
    }

    const parsedUrl = new URL(dbUrl);

    const pool = new Pool({
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port) || 5432,
      user: parsedUrl.username,
      password: decodeURIComponent(parsedUrl.password),
      database: parsedUrl.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: false },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}