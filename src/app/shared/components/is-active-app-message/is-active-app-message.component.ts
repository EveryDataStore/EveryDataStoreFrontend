import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-is-active-app-message',
  templateUrl: './is-active-app-message.component.html',
  styleUrls: ['./is-active-app-message.component.scss']
})
export class IsActiveAppMessageComponent implements OnInit {
 
  @Input() 
  isActiveApp = false;

  @Input()
  appName = "";

  constructor() { }

  ngOnInit(): void {
  }

}
