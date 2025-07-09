import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Splitter } from 'primeng/splitter';
import { debounceTime, Observable, Subject } from 'rxjs';
import { ElectronService } from '../data-services/electron/electron.service';

@Component({
  selector: 'app-site-template',
  templateUrl: './site-template.component.html',
  styleUrls: ['./site-template.component.scss']
})
export class SiteTemplateComponent {
  splitterPanels: any[] = []
  selectedActivity: string = 'explorer';
  disablePanels: boolean = false;
  windowResizing$: Subject<boolean>;
  isElectron: boolean;
  projectHomeUrl$: Observable<string | undefined>;

  constructor(electronService: ElectronService) {
    this.windowResizing$ = new Subject();
    this.windowResizing$.pipe(debounceTime(200)).subscribe(() => {
      this.disablePanels = false;
    });
    this.isElectron = electronService.isElectron();
    this.projectHomeUrl$ = electronService.getProjectHomeUrl();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.disablePanels = true;
    this.windowResizing$.next(true);
  }

  public onResizeStart(event: any) {
    this.disablePanels = true;
  }

  public onResizeEnd(event: any) {
    this.disablePanels = false;
  }
}
