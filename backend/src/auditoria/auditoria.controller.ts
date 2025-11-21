import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  registrar(@Body() data: any) {
    return this.auditoriaService.registrarAuditoria(data);
  }

  @Get()
  obtener() {
    return this.auditoriaService.obtenerAuditorias();
  }

  @Get(':userId')
  obtenerPorUsuario(@Param('userId') userId: string) {
    return this.auditoriaService.obtenerPorUsuario(userId);
  }
}
