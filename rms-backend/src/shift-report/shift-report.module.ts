import { Module } from '@nestjs/common';
import { ShiftReportController } from './shift-report.controller';
import { ShiftReportService } from './shift-report.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShiftReportController],
  providers: [ShiftReportService],
})
export class ShiftReportModule {}
