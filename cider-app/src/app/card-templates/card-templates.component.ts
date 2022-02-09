import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss']
})
export class CardTemplatesComponent implements OnInit {
  htmlEditorOptions: any = {theme: 'vs-dark', language: 'html', automaticLayout: true};
  cssEditorOptions: any = {theme: 'vs-dark', language: 'css', automaticLayout: true};
  html: string = '<div>\n\t<h2>Poison Apple</h2>\n\t<p>Activate this card now.</p>\n</div>';
  css: string = 'div {\n\tpadding: 25px;\n}\nh2 {\n\tcolor: rgb(129, 156, 89);\n}';

  constructor(private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  safeCss(style: string) {
    return this.domSanitizer.bypassSecurityTrustStyle(style);
  }

  safeHtmlAndStyle(html: string, css: string) {
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, '.card-preview $1');
    let safeStyle = this.domSanitizer.sanitize(SecurityContext.STYLE, sanitizedStyle);
    let safeHtml = this.domSanitizer.sanitize(SecurityContext.HTML, html);
    return this.domSanitizer.bypassSecurityTrustHtml(`${safeHtml}<style>${safeStyle}</style>`);
  }

}
