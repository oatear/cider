import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from '../electron/electron.service';
import { PersistentPath } from '../types/persistent-path.type';

/**
 * Local storage is used for storing user preferences
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  static readonly RECENT_PROJECT_URLS = "recent-project-urls";
  static readonly MAX_RECENT_PROJECT_URLS = 5;
  static readonly DARK_MODE = "dark-mode";

  public recentProjectUrls: BehaviorSubject<PersistentPath[]>;

  constructor(
      private electronService: ElectronService) {
    this.recentProjectUrls = new BehaviorSubject<PersistentPath[]>(
      this.getRecentProjectUrlsFromLocalStorage());
     
    // clean up the recent project urls -- remove any that are empty or don't exist
    this.cleanRecentProjectUrls().then(urls => {
      localStorage.setItem(LocalStorageService.RECENT_PROJECT_URLS, JSON.stringify(urls));
      this.recentProjectUrls.next(urls);
    });
  }

  public addRecentProjectUrl(persistentUrl: PersistentPath) {
    let urls = this.getRecentProjectUrlsFromLocalStorage();
    urls = urls.filter(item => item.path !== persistentUrl.path);
    if (urls.length >= LocalStorageService.MAX_RECENT_PROJECT_URLS) {
      urls.pop();
    }
    urls.unshift(persistentUrl);
    localStorage.setItem(LocalStorageService.RECENT_PROJECT_URLS, JSON.stringify(urls));
    this.recentProjectUrls.next(urls);
  }

  private getRecentProjectUrlsFromLocalStorage() : PersistentPath[] {
    const urlsString : string | null = localStorage.getItem(LocalStorageService.RECENT_PROJECT_URLS);
    if (urlsString === null) {
      return [];
    }
    const urls = JSON.parse(urlsString);
    // if urls is an array of strings, convert it to an array of PersistentUrl objects
    if (urls.length > 0 && typeof urls[0] === 'string') {
      return urls.map((url: any) => ({ url, bookmark: '' }));
    }
    // if urls is already an array of PersistentUrl objects, return it as is
    return urls;
  }

  public getLanguage(): string | null {
    return localStorage.getItem('language');
  }

  public setLanguage(lang: string) {
    localStorage.setItem('language', lang);
  }

  /**
   * Filter out any directories that are empty or don't exist from the recent project urls
   * 
   * @returns 
   */
  public cleanRecentProjectUrls() : Promise<PersistentPath[]> {
    const urls = this.getRecentProjectUrlsFromLocalStorage();
    const promises = urls.map(url => this.electronService.listDirectory(url)
      .then(files => files.length > 0 ? url : undefined));
    const validUrls = Promise.all(promises).then((urls) => urls.filter(url => url !== undefined));
    return validUrls as Promise<PersistentPath[]>;
  }

  public getRecentProjectUrls() {
    return this.recentProjectUrls.asObservable();
  }

  public getDarkMode() : boolean {
    const darkMode = localStorage.getItem(LocalStorageService.DARK_MODE);
    return darkMode === 'true' || darkMode === null; // Default to true if not set
  }

  public setDarkMode(darkMode: boolean) {
    localStorage.setItem(LocalStorageService.DARK_MODE, darkMode.toString());
  }

}
