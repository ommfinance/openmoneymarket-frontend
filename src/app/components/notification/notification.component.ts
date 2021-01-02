import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {NotificationService} from "../../services/notification/notification.service";

declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  @ViewChild('ntf', { static: true }) notificationEl!: ElementRef;

  @Input() message = "This is a confirmation notification.";

  notificationSubscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.notificationSubscription = this.notificationService.activeNotificationChange$.subscribe((action) => {
      this.message = action.message;
      this.notificationService.showNotification(this.notificationEl.nativeElement);
    });
  }

  ngOnInit(): void {
  }

}
