import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepo: Repository<Auditoria>,
  ) {}

  crearEvento(data: Partial<Auditoria>) {
    const evento = this.auditoriaRepo.create(data);
    return this.auditoriaRepo.save(evento);
  }

  obtenerHistorialPorPropuesta(propuestaId: number) {
    return this.auditoriaRepo.find({
      where: { propuestaId },
      order: { fecha: 'DESC' },
    });
  }
}