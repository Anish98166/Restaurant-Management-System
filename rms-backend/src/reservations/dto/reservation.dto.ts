import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ReservationStatus } from '@prisma/client';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  tableId: string;

  @ApiProperty({ example: 'John Smith' })
  @IsString()
  guestName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(50)
  partySize: number;

  @ApiProperty({ example: '2026-05-10', description: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @ApiProperty({ example: '19:30', description: 'HH:MM (24h)' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be HH:MM' })
  time: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}

export class UpdateReservationStatusDto {
  @ApiProperty({ enum: ReservationStatus })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}

export class ReservationQueryDto {
  @IsOptional()
  date?: string;

  @IsOptional()
  tableId?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
