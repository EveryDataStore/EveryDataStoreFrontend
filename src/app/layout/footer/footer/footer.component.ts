import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/shared/services/settings.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  date: Date;
  dataStoreName: string;
  memberEmail: string;
  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.date = new Date();
    this.memberEmail = this.settingsService.getMemberEmail() ?  this.settingsService.getMemberEmail() : null;
    this.dataStoreName = this.settingsService.getDataStoreName() ?  this.settingsService.getDataStoreName() : null;
}

}
