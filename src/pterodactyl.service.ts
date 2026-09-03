import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PterodactylService implements OnModuleInit {
  private readonly logger = new Logger(PterodactylService.name);

  constructor(private configService: ConfigService) {}

  // Esto se ejecuta automáticamente cuando el bot arranca
  async onModuleInit() {
    this.logger.log(' Probando conexión con Pterodactyl...');
    await this.probarConexion();
  }

  async probarConexion() {
    const url = this.configService.get<string>('PTERODACTYL_URL');
    const key = this.configService.get<string>('PTERODACTYL_API_KEY');

    if (!url || !key) {
      this.logger.error(' No se encontraron las variables PTERODACTYL_URL o PTERODACTYL_API_KEY en el .env');
      return;
    }

    try {
      // 1. Limpiamos espacios y barras diagonales rebeldes al final de la URL
      const baseUrl = url.replace(/\/+$/, ''); 
      const finalUrl = `${baseUrl}/api/client`;

      this.logger.log(` Conectando a: ${finalUrl}`); // Esto nos dirá exactamente a dónde va

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(' ¡Conexión con Pterodactyl exitosa!');
      this.logger.log(`Servidores encontrados: ${data.data.length}`);
      
      data.data.forEach((server: any) => {
        this.logger.log(`- ${server.attributes.name} (ID: ${server.attributes.identifier})`);
      });

    } catch (error: unknown) {
      // 2. Imprimimos el objeto de error completo para ver la causa real si vuelve a fallar
      this.logger.error(` Error al conectar al panel:`, error);
    }
  }
}