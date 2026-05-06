import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocationsService, CreateLocationDto, UpdateLocationDto } from './locations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations (Admin only)' })
  findAll() { return this.locationsService.findAll(); }

  @Get('analytics')
  @ApiOperation({ summary: 'Cross-location analytics (Admin only)' })
  getAnalytics() { return this.locationsService.getCrossLocationAnalytics(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID (Admin only)' })
  findOne(@Param('id') id: string) { return this.locationsService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create a location (Admin only)' })
  create(@Body() dto: CreateLocationDto) { return this.locationsService.create(dto); }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto) { return this.locationsService.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location (Admin only)' })
  remove(@Param('id') id: string) { return this.locationsService.remove(id); }
}
