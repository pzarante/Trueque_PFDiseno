import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1323',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuditoriaModule, // 👈 Asegúrate de que esto esté aquí
  ],
})
export class AppModule {}