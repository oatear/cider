import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';

// setup in index.html
declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{

  constructor(private router: Router) {
  }

  ngOnInit() {
      this.updateViewWidthHeightVar();
      window.addEventListener('resize', () => {
        this.updateViewWidthHeightVar();
      });

      this.setUpAnalytics();
  }

  private setUpAnalytics() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event) => {
            gtag('config', 'G-4B83EBZERL',
                {
                    page_path: (<NavigationEnd>event).urlAfterRedirects
                }
            );
        });
  }

  private updateViewWidthHeightVar() {
    let vh = window.innerHeight * 0.01;
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  }
}
