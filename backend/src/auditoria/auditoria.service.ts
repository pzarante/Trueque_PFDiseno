import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuditoriaService {
  private readonly baseUrl = process.env.ROBLE_API_BASE;
  private readonly dbName = process.env.ROBLE_DB_NAME;

  private apiKey = process.env.ROBLE_API_KEY;
  private refreshToken = process.env.ROBLE_REFRESH_TOKEN;

  private readonly logger = new Logger(AuditoriaService.name);

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // 🔁 Refrescar token automáticamente
  private async refrescarToken() {
    try {
      this.logger.warn('♻️ Intentando refrescar token de ROBLE...');

      const res = await axios.post(
        `${this.baseUrl}/auth/${this.dbName}/refresh-token`,
        { refreshToken: this.refreshToken }
      );

      const body: any = res.data;

      this.apiKey = body.accessToken;

      if (body.refreshToken) {
        this.refreshToken = body.refreshToken;
      }

      this.logger.log('✅ Token actualizado correctamente.');
    } catch (error: any) {
      this.logger.error('❌ Error al refrescar token de ROBLE');
      this.logger.error(error.response?.data || error.message);
    }
  }

  // 📝 Registrar evento de auditoría (se guarda en la tabla trueques)
  async registrarAuditoria(data: any) {
    const url = `${this.baseUrl}/database/${this.dbName}/insert`;

    // OJO: usar los mismos nombres que ya tiene la tabla en ROBLE
    const record = {
      id_usuario1: data.id_oferente ?? null,
      id_usuario2: data.id_destinatario ?? null,
      id_productofErente: data.id_producto ?? null,         // mismo typo que la tabla
      id_productDestinatario: data.id_productos ?? null,
      status: data.status ?? null,
      fecha_creacion: data.fecha_creacion ?? new Date().toISOString(),
      fecha_confirmacion: data.fecha_concretado ?? null,
      confirmacion_oferente: data.confirmacion_oferente ?? null,
      confirmacion_destinatario: data.confirmacion_destinatario ?? null,
    };

    try {
      const res = await axios.post(
        url,
        { tableName: 'trueques', records: [record] },
        { headers: this.headers() }
      );

      this.logger.log('✅ Auditoría registrada correctamente.');
      return res.data;

    } catch (error: any) {
      const status = error.response?.status;

      this.logger.error('🛑 Error al registrar auditoría');
      this.logger.error(error.response?.data || error.message);

      if (status === 401) {
        await this.refrescarToken();
        this.logger.log('🔄 Reintentando registrar auditoría...');
        return this.registrarAuditoria(data);
      }

      throw new Error('Error al registrar auditoría en ROBLE');
    }
  }

  // 📖 Leer TODAS las auditorías desde ROBLE
  async obtenerAuditorias() {
    const url = `${this.baseUrl}/database/${this.dbName}/read`;

    try {
      const res = await axios.get(url, {
        headers: this.headers(),
        params: { tableName: 'trueques' },
      });

      // En tu screenshot se ve que ROBLE devuelve un array directamente
      // así que devolvemos res.data tal cual
      return res.data;

    } catch (error: any) {
      const status = error.response?.status;

      this.logger.error('❌ Error al obtener auditorías');
      this.logger.error(error.response?.data || error.message);

      if (status === 401) {
        await this.refrescarToken();
        return this.obtenerAuditorias();
      }

      throw new Error('Error al leer auditorías');
    }
  }

  // 🔎 Leer auditorías filtradas por usuario, PERO filtrando en NestJS
  async obtenerPorUsuario(userId: string) {
    try {
      const auditorias: any[] = await this.obtenerAuditorias();

      // Filtramos en memoria por id_usuario1 o id_usuario2
      const filtradas = auditorias.filter((a) =>
        a.id_usuario1 === userId || a.id_usuario2 === userId
      );

      return filtradas;

    } catch (error: any) {
      this.logger.error('❌ Error al filtrar auditoría por usuario');
      this.logger.error(error.response?.data || error.message);
      throw new Error('Error al filtrar auditoría por usuario');
    }
  }
}
