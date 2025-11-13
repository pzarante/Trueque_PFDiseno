import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  registrar(@Body() data: any) {
    return this.auditoriaService.registrarAuditoria(data);
  }

  @Get()
  obtenerTodas() {
    return this.auditoriaService.obtenerAuditoria();
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() cambios: any) {
    return this.auditoriaService.registrarAuditoria({ _id: id, ...cambios });
  }
}
