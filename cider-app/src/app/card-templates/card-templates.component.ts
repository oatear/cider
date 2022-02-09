import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss']
})
export class CardTemplatesComponent implements OnInit {
  htmlEditorOptions: any = {theme: 'vs-dark', language: 'html', automaticLayout: true};
  cssEditorOptions: any = {theme: 'vs-dark', language: 'css', automaticLayout: true};
  html: string = '<h2>Poison Apple</h2>\n<div>Activate this card now.</div>';
  css: string = 'padding: 25px;';

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  safeCss(style: string) {
    return this.domSanitizer.bypassSecurityTrustStyle(style);
  }

}
