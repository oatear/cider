import { Component, OnInit } from '@angular/core';
import { DocumentsService } from '../data-services/services/documents.service';
import { Document } from '../data-services/types/document.type';
import { AssetsService } from '../data-services/services/assets.service';
import { HandlebarsPipe } from '../shared/pipes/handlebars.pipe';
import { AppDB } from '../data-services/indexed-db/db';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-site-content',
    templateUrl: './site-content.component.html',
    styleUrls: ['./site-content.component.scss'],
    standalone: false
})
export class SiteContentComponent implements OnInit {
  protected globalDocument: Document | undefined;
  assetUrls: any;

  constructor(private db: AppDB,
      private documentsService: DocumentsService,
      private assetsService: AssetsService,
      private handlebarsPipe: HandlebarsPipe) {
    this.assetsService.getAssetUrls().subscribe(assetUrls => {
      this.assetUrls = assetUrls;
      this.refreshGlobalStyles(true);
    });
  }

  ngOnInit(): void {
    // make sure to listen for global styles document updates
    // db on change event may be too frequent, consider optimizing
    this.db.onChange().pipe(debounceTime(2000)).subscribe(() => {
      this.refreshGlobalStyles();
    });
  }

  private refreshGlobalStyles(forceUpdate: boolean = false) {
    this.documentsService.getAll({ name: 'global-styles' }).then(documents => {
      if (documents.length > 0) {
        if (forceUpdate || this.globalDocument?.content !== documents[0].content) {
          this.globalDocument = documents[0];
          this.addGlobalStyles();
        }
      }
    });
  }

  private addGlobalStyles() {
    console.log('Adding global styles to site content component', this.assetUrls);
    const uniqueId = 'project-global-styles';

    // check if style tag already exists and if not, create it
    let style = document.getElementById(uniqueId);
    if (!style) {
      const head = document.getElementsByTagName('head')[0];
      style = document.createElement('style');
      style.id = uniqueId;
      head.appendChild(style);
    } 

    // update the style content
    const css = this.handlebarsPipe.transform(this.globalDocument?.content || '', this.assetUrls);
    style.innerHTML = css;
  }

}
