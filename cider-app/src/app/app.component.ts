import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { PrimeNGConfig } from 'primeng/api';
import { filter } from 'rxjs';

// setup in index.html
declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(private primengConfig: PrimeNGConfig, 
    private router: Router) {
  }

  ngOnInit() {
      this.primengConfig.ripple = true;

      this.updateViewHeightVar();
      window.addEventListener('resize', () => {
        this.updateViewHeightVar();
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

  private updateViewHeightVar() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}
