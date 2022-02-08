import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss']
})
export class CardTemplatesComponent implements OnInit {
  html: string = '';
  css: string = '';

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  safeCss(style: string) {
    return this.domSanitizer.bypassSecurityTrustStyle(style);
  }

}
