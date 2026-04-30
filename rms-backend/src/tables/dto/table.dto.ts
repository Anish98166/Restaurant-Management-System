import { IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';

export class CreateTableDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  tableNumber: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ enum: TableStatus, default: TableStatus.AVAILABLE })
  @IsEnum(TableStatus)
  @IsOptional()
  status?: TableStatus;
}

export class UpdateTableDto extends PartialType(CreateTableDto) {}

export class UpdateTableStatusDto {
  @ApiProperty({ enum: TableStatus })
  @IsEnum(TableStatus)
  status: TableStatus;
}
