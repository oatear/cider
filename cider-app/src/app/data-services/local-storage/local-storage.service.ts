import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  constructor() {
    this.recentProjectUrls = new BehaviorSubject<string[]>(
      this.getRecentProjectUrlsFromLocalStorage());
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

  public getRecentProjectUrls() {
    return this.recentProjectUrls.asObservable();
  }
}
