import {Injectable} from '@angular/core';
import {NotifierService} from "angular-notifier";


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  public notificationMessageToShow?: string;

  constructor(private notifierService: NotifierService) { }

  // Show a notification
  private showNotification(message: string ): void {
    this.notifierService.notify( "info", message );
  }

  public showNewNotification(message: string): void {
    this.showNotification(message);
  }

  showNotificationToShow(): void {
    if (this.notificationMessageToShow) {
      this.showNotification(this.notificationMessageToShow);
    }
  }

  setNotificationToShow(message: string): void {
    this.notificationMessageToShow = message;
  }

  hideOldest(): void {
    this.notifierService.hideOldest();
  }
}
