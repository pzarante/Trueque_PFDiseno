import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { Auditoria } from './entities/auditoria.entity';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  crearEvento(@Body() data: Partial<Auditoria>) {
    return this.auditoriaService.crearEvento(data);
  }

  @Get('propuesta/:id')
  obtenerHistorial(@Param('id') id: string) {
    return this.auditoriaService.obtenerHistorialPorPropuesta(Number(id));
  }
}