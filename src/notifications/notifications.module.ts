import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsInteractionHandler } from './notifications-interaction.handler';
import { NotificationsPanelService } from './notifications-panel.service';

@Module({
  providers: [
    NotificationsService,
    NotificationsInteractionHandler,
    NotificationsPanelService,
  ],
  exports: [
    NotificationsService,
    NotificationsInteractionHandler,
    NotificationsPanelService,
  ],
})
export class NotificationsModule {}
