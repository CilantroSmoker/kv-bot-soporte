import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    // Guarda tu clave secreta en el archivo .env
    if (apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('No autorizado');
    }
    return true;
  }
}