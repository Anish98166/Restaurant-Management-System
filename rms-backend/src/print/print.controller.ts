import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrintService } from './print.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Print')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('print')
export class PrintController {
  constructor(private printService: PrintService) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get kitchen ticket for an order (JSON + text + HTML)' })
  getOrderTicket(@Param('orderId') orderId: string) {
    return this.printService.getOrderTicket(orderId);
  }

  @Get('order/:orderId/html')
  @ApiOperation({ summary: 'Get kitchen ticket as printable HTML' })
  async getOrderTicketHtml(@Param('orderId') orderId: string, @Res() res: Response) {
    const { html } = await this.printService.getOrderTicket(orderId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('receipt/:paymentId')
  @ApiOperation({ summary: 'Get receipt ticket for a payment (JSON + text + HTML)' })
  getReceiptTicket(@Param('paymentId') paymentId: string) {
    return this.printService.getReceiptTicket(paymentId);
  }

  @Get('receipt/:paymentId/html')
  @ApiOperation({ summary: 'Get receipt as printable HTML' })
  async getReceiptHtml(@Param('paymentId') paymentId: string, @Res() res: Response) {
    const { html } = await this.printService.getReceiptTicket(paymentId);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
