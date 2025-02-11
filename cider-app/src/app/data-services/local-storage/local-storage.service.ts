import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../electron/electron.service';

/**
 * Local storage is used for storing user preferences
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static readonly RECENT_PROJECT_URLS = "recent-project-urls";
  static readonly MAX_RECENT_PROJECT_URLS = 5;

  public recentProjectUrls: BehaviorSubject<string[]>;

  constructor(
      private electronService: ElectronService) {
    this.recentProjectUrls = new BehaviorSubject<string[]>(
      this.getRecentProjectUrlsFromLocalStorage());
     
    // clean up the recent project urls -- remove any that are empty or don't exist
    this.cleanRecentProjectUrls().then(urls => {
      localStorage.setItem(LocalStorageService.RECENT_PROJECT_URLS, JSON.stringify(urls));
      this.recentProjectUrls.next(urls);
    });
  }

  public addRecentProjectUrl(url : string) {
    let urls = this.getRecentProjectUrlsFromLocalStorage();
    urls = urls.filter(item => item !== url);
    if (urls.length >= LocalStorageService.MAX_RECENT_PROJECT_URLS) {
      urls.pop();
    }
    urls.unshift(url);
    localStorage.setItem(LocalStorageService.RECENT_PROJECT_URLS, JSON.stringify(urls));
    this.recentProjectUrls.next(urls);
  }

  private getRecentProjectUrlsFromLocalStorage() : string[] {
    const urlsString : string | null = localStorage.getItem(LocalStorageService.RECENT_PROJECT_URLS);
    if (urlsString === null) {
      return [];
    }
    return JSON.parse(urlsString);
  }

  /**
   * Filter out any directories that are empty or don't exist from the recent project urls
   * 
   * @returns 
   */
  public cleanRecentProjectUrls() : Promise<string[]> {
    const urls = this.getRecentProjectUrlsFromLocalStorage();
    const promises = urls.map(url => this.electronService.listDirectory(url)
      .then(files => files.length > 0 ? url : ""));
    const validUrls = Promise.all(promises).then((urls) => urls.filter(url => url !== ""));
    return validUrls;
  }

  public getRecentProjectUrls() {
    return this.recentProjectUrls.asObservable();
  }
}
