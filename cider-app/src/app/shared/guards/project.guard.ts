import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ElectronService } from '../../data-services/electron/electron.service';
import { PersistentPath } from 'src/app/data-services/types/persistent-path.type';

@Injectable({
  providedIn: 'root'
})
export class ProjectGuard  {
  projectHomeUrl$: Observable<PersistentPath | undefined>;
  projectUnsaved$: Observable<boolean>;

  constructor(private electronService: ElectronService,
    private router: Router) {
    this.projectHomeUrl$ = electronService.getProjectHomeUrl();
    this.projectUnsaved$ = electronService.getProjectUnsaved();
  }

  /**
   * Allows access whenever a project home url is selected
   * 
   * @param route 
   * @param state 
   * @returns 
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.electronService.isElectron()) {
      return true;
    }
    return Promise.all([firstValueFrom(this.projectHomeUrl$),
      firstValueFrom(this.projectUnsaved$)]).then(([homeUrl, unsaved]) => {
        if (homeUrl || unsaved) {
          return true;
        }
        this.router.navigate(['/']);
        return false;
      });
  }
  
}
