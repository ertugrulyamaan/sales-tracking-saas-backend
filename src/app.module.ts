import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { SalesModule } from './modules/sales/sales.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { TargetsModule } from './modules/targets/targets.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, WorkspaceModule, SalesModule, RefundsModule, TargetsModule, AnalyticsModule,  ConfigModule.forRoot({
    isGlobal: true,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
