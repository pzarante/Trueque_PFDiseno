import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
