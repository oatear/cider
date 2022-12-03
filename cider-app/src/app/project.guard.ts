import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ElectronService } from './data-services/electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectGuard implements CanActivate {
  projectHomeUrl$: Observable<string | undefined>;
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
        if (typeof homeUrl === 'string' || unsaved) {
          return true;
        }
        this.router.navigate(['/']);
        return false;
      });
  }
  
}
