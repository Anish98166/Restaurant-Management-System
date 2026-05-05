import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ModifiersService } from './modifiers.service';
import {
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  CreateModifierDto,
  UpdateModifierDto,
} from './dto/modifier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Modifiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menu/:menuItemId/modifiers')
export class ModifiersController {
  constructor(private modifiersService: ModifiersService) {}

  @Get()
  @ApiOperation({ summary: 'Get modifier groups for a menu item' })
  getGroups(@Param('menuItemId') menuItemId: string) {
    return this.modifiersService.getGroupsForMenuItem(menuItemId);
  }

  @Post('groups')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create modifier group (Admin only)' })
  createGroup(@Param('menuItemId') menuItemId: string, @Body() dto: CreateModifierGroupDto) {
    return this.modifiersService.createGroup(menuItemId, dto);
  }

  @Put('groups/:groupId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update modifier group (Admin only)' })
  updateGroup(@Param('groupId') groupId: string, @Body() dto: UpdateModifierGroupDto) {
    return this.modifiersService.updateGroup(groupId, dto);
  }

  @Delete('groups/:groupId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete modifier group (Admin only)' })
  deleteGroup(@Param('groupId') groupId: string) {
    return this.modifiersService.deleteGroup(groupId);
  }

  @Post('groups/:groupId/modifiers')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add modifier to group (Admin only)' })
  addModifier(@Param('groupId') groupId: string, @Body() dto: CreateModifierDto) {
    return this.modifiersService.addModifier(groupId, dto);
  }

  @Put('groups/:groupId/modifiers/:modifierId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update modifier (Admin only)' })
  updateModifier(@Param('modifierId') modifierId: string, @Body() dto: UpdateModifierDto) {
    return this.modifiersService.updateModifier(modifierId, dto);
  }

  @Delete('groups/:groupId/modifiers/:modifierId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete modifier (Admin only)' })
  deleteModifier(@Param('modifierId') modifierId: string) {
    return this.modifiersService.deleteModifier(modifierId);
  }
}
