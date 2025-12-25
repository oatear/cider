import { Component, HostBinding, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';
import { LocalStorageService } from './data-services/local-storage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';

// setup in index.html
declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(private router: Router,
              private localStorageService: LocalStorageService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
      this.updateViewWidthHeightVar();
      window.addEventListener('resize', () => {
        this.updateViewWidthHeightVar();
      });

      // this.setUpAnalytics();
      this.initDarkMode();
      this.initTranslateService();
  }

  // private setUpAnalytics() {
  //   this.router.events.pipe(filter(event => event instanceof NavigationEnd))
  //       .subscribe((event) => {
  //           gtag('config', 'G-4B83EBZERL',
  //               {
  //                   page_path: (<NavigationEnd>event).urlAfterRedirects
  //               }
  //           );
  //       });
  // }

  private initTranslateService() {
    this.translateService.addLangs(['en', 'fr', 'es', 'bg', 'de', 'it', 
      'pt', 'ru', 'pl', 'uk', 'ko', 'ja', 'zh-Hans', 'zh-Hant', 'tr', 'nl']);

    const browserLang = this.translateService.getBrowserCultureLang?.() || this.translateService.getBrowserLang();
    const lowerBrowserLang = browserLang?.toLowerCase();
    const normalizedBrowserLang = lowerBrowserLang?.startsWith('zh')
      ? (lowerBrowserLang.includes('hant') || lowerBrowserLang.includes('tw') || lowerBrowserLang.includes('hk') || lowerBrowserLang.includes('mo') ? 'zh-Hant' : 'zh-Hans')
      : browserLang;
    const savedLang = this.localStorageService.getLanguage();
    const langToSet = savedLang ? savedLang : (normalizedBrowserLang && this.translateService.getLangs().includes(normalizedBrowserLang) ? normalizedBrowserLang : 'en');
    this.translateService.use(langToSet);
  }

  private updateViewWidthHeightVar() {
    let vh = window.innerHeight * 0.01;
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  }

  private initDarkMode() {
    const darkMode = this.localStorageService.getDarkMode()
    document.querySelector('html')?.classList.toggle(LocalStorageService.DARK_MODE, darkMode);
  }
}
