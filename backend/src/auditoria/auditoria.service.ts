import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuditoriaService {
  private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co';
  private readonly dbName = 'maquina_d89c67eaa5';

  private apiKey = process.env.ROBLE_API_KEY;
  private refreshToken = process.env.ROBLE_REFRESH_TOKEN; // 👈 NO readonly

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
      // nuevo accessToken
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
      usuario: data.usuario,
      propuesto: data.propuesto,
      ofertaA: data.ofertaA,
      ofertaB: data.ofertaB ?? null,
      estado: data.estado ?? 'pendiente',
      fecha: new Date().toISOString(),
    };

    try {
      const res = await axios.post(
        url,
        { tableName: 'auditoria', records: [record] },
        { headers: this.headers() }
      );

      this.logger.log('✅ Auditoría registrada correctamente.');
      return res.data;
    } catch (error: any) {
      const status = error.response?.status;

      this.logger.error('🛑 Error al registrar auditoría:');
      this.logger.error(error.response?.data || error.message);

      if (status === 401) {
        await this.refrescarToken();
        this.logger.log('🔄 Reintentando registrar auditoría...');
        return this.registrarAuditoria(data);
      }

      throw new Error('Error al registrar auditoría en ROBLE');
    }
  }

  // 📖 Leer auditoría
  async obtenerAuditoria() {
    const url = `${this.baseUrl}/database/${this.dbName}/read`;

    try {
      const res = await axios.get(url, {
        headers: this.headers(),
        params: { tableName: 'auditoria' },
      });

      return res.data;
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        await this.refrescarToken();
        return this.obtenerAuditoria();
      }

      this.logger.error('❌ Error al obtener auditoría');
      throw new Error('Error al leer auditoría');
    }
  }
}
