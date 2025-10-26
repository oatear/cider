import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ElectronService } from '../data-services/electron/electron.service';
import PackageUtils from '../shared/utils/package-utils';
import { PersistentPath } from '../data-services/types/persistent-path.type';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent implements OnInit {
  projectHomeUrl$: Observable<PersistentPath | undefined>;
  projectUnsaved$: Observable<boolean>;
  appVersion: string = '0.0.0';

  constructor(private electronService : ElectronService) {
    this.projectHomeUrl$ = this.electronService.getProjectHomeUrl();
    this.projectUnsaved$ = this.electronService.getProjectUnsaved();
    this.appVersion = PackageUtils.getVersion();
  }

  ngOnInit(): void {
  }

  navigateToGithub() {
    window.open('https://github.com/oatear/cider', "_blank");
  }
  navigateToUserGuide() {
    window.open('https://oatear.github.io/cider-docs/docs/overview', "_blank");
  }
  navigateToDiscord() {
    window.open('https://discord.gg/S66xw9Wc9V', "_blank");
  }

}
