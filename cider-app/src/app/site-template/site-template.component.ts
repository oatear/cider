import { Component, HostListener } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-site-template',
  templateUrl: './site-template.component.html',
  styleUrls: ['./site-template.component.scss']
})
export class SiteTemplateComponent {
  disablePanels: boolean = false;
  windowResizing$: Subject<boolean>;

  constructor() {
    this.windowResizing$ = new Subject();
    this.windowResizing$.pipe(debounceTime(200)).subscribe(() => {
      this.disablePanels = false;
    });
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
