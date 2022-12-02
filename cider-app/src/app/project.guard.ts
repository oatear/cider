import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ElectronService } from './data-services/electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectGuard implements CanActivate {
  projectHomeUrl$: Observable<string | undefined>;

  constructor(private electronService: ElectronService,
    private router: Router) {
    this.projectHomeUrl$ = electronService.getProjectHomeUrl();
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
    //return firstValueFrom(this.projectHomeUrl$).then(homeUrl => typeof homeUrl === 'string');
    return firstValueFrom(this.projectHomeUrl$).then(homeUrl => {
      if (typeof homeUrl === 'string') {
        return true;
      }
      this.router.navigate(['/welcome']);
      return false;
    });
  }
  
}
