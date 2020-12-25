import {Component, Input, OnInit} from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  @Input() message = "This is a confirmation notification.";

  constructor() { }

  ngOnInit(): void {
  }

  showNotification(message: string, type: string): void {
    this.message = message;
    $('.notification').toggleClass('active');
  }

  // On "Notification" click
  // $(".notification-trigger").click(function() {
  //   $('.notification').toggleClass('active');
  // });

}
