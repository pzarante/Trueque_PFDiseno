import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  propuestaId: number;

  @Column()
  usuarioAccion: number;

  @Column()
  accion: string;

  @Column()
  detalle: string;

  @CreateDateColumn()
  fecha: Date;
}