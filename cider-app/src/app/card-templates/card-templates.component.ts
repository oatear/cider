import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardTemplate } from '../data-services/types/card-template.type';

@Component({
  selector: 'app-card-templates',
  templateUrl: './card-templates.component.html',
  styleUrls: ['./card-templates.component.scss']
})
export class CardTemplatesComponent implements OnInit {
  static readonly DEFAULT_HTML: string = '<div>\n\t<h2>Poison Apple</h2>\n\t<p>Activate this card now.</p>\n</div>';
  static readonly DEFAULT_CSS: string = 'div {\n\twidth: 300px;\n\theight: 400px;\n\t'
    + 'background-color: rgb(37, 37, 37);\n\tborder: 1px solid black;\n\tpadding: 25px;\n}\n'
    + 'h2 {\n\tcolor: rgb(129, 156, 89);\n}';

  htmlEditorOptions: any = {theme: 'vs-dark', language: 'html', automaticLayout: true};
  cssEditorOptions: any = {theme: 'vs-dark', language: 'css', automaticLayout: true};
  html: string = CardTemplatesComponent.DEFAULT_HTML;
  css: string = CardTemplatesComponent.DEFAULT_CSS;
  templates: CardTemplate[] = [];
  selectedTemplate?: CardTemplate;

  constructor(private domSanitizer: DomSanitizer, 
    private cardTemplatesService: CardTemplatesService) { }

  ngOnInit(): void {
    this.cardTemplatesService.getAll().then(templates => this.templates = templates);
  }

  safeCss(style: string) {
    return this.domSanitizer.bypassSecurityTrustStyle(style);
  }

  safeHtmlAndStyle(html: string, css: string) {
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, '.card-preview $1').replace(/\!important/g, '');
    let safeStyle = this.domSanitizer.sanitize(SecurityContext.STYLE, sanitizedStyle);
    let safeHtml = this.domSanitizer.sanitize(SecurityContext.HTML, html);
    return this.domSanitizer.bypassSecurityTrustHtml(`${safeHtml}<style>${safeStyle}</style>`);
  }

}
