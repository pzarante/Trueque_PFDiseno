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

      this.logger.log('✅ Token de ROBLE actualizado automáticamente.');
    } catch (error: any) {
      this.logger.error('❌ Error al refrescar token de ROBLE');
      this.logger.error(error.response?.data || error.message);
    }
  }

  // 📝 Registrar evento de auditoría
  async registrarAuditoria(data: any) {
    const url = `${this.baseUrl}/database/${this.dbName}/insert`;

    const record = {
      id_oferente: data.id_oferente ?? null,
      id_destinatario: data.id_destinatario ?? null,
      id_producto: data.id_producto ?? null,
      status: data.status ?? null,
      fecha_concretado: data.fecha_concretado ?? null,
      confirmacion_oferente: data.confirmacion_oferente ?? null,
      confirmacion_destinatario: data.confirmacion_destinatario ?? null,
      id_productos: data.id_productos ?? null,
      fecha_creacion: data.fecha_creacion ?? new Date().toISOString(),
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

  // 📖 Leer auditorías (GET correcto)
  async obtenerAuditorias() {
    const url = `${this.baseUrl}/database/${this.dbName}/read`;

    try {
      const res = await axios.get(url, {
        headers: this.headers(),
        params: { tableName: 'trueques' }, // ← GET con query params
      });

      return res.data;

    } catch (error: any) {
      const status = error.response?.status;

      this.logger.error('❌ Error al obtener auditoría');
      this.logger.error(error.response?.data || error.message);

      if (status === 401) {
        await this.refrescarToken();
        return this.obtenerAuditorias();
      }

      throw new Error('Error al leer auditoría');
    }
  }
}
