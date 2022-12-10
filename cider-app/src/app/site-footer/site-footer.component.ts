import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ElectronService } from '../data-services/electron/electron.service';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent implements OnInit {
  projectHomeUrl$: Observable<string | undefined>;
  projectUnsaved$: Observable<boolean>;

  constructor(private electronService : ElectronService) {
    this.projectHomeUrl$ = this.electronService.getProjectHomeUrl();
    this.projectUnsaved$ = this.electronService.getProjectUnsaved();
  }

  ngOnInit(): void {
  }

}
