import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { IncidentsModule } from './incidents/incidents.module.js';
import { EventsModule } from './events/events.module.js';
import { ServiceCatalogModule } from './service-catalog/service-catalog.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.SQL_HOST || 'localhost',
      port: parseInt(process.env.SQL_PORT ?? '1433', 10),
      username: process.env.SQL_USER || 'sa',
      password: process.env.SQL_PASSWORD || 'YourStrong!Passw0rd',
      database: process.env.SQL_DB_NAME || 'IncidentDb',
      autoLoadEntities: true,
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/incidentdb',
    ),
    IncidentsModule,
    EventsModule,
    ServiceCatalogModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
