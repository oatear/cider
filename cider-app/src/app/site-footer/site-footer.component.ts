import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ElectronService } from '../data-services/electron/electron.service';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.scss']
})
export class SiteFooterComponent implements OnInit {
  projectHomeUrl$ : Observable<string | undefined>;

  constructor(private electronService : ElectronService) {
    this.projectHomeUrl$ = this.electronService.getProjectHomeUrl();
  }

  ngOnInit(): void {
  }

}
