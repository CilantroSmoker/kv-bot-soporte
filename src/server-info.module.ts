import { Module } from '@nestjs/common';
import { ServerStatusService } from './services/server-status.service';

@Module({
  providers: [
    ServerStatusService,
  ],
  exports: [
    ServerStatusService,
  ],
})
export class ServerInfoModule {}