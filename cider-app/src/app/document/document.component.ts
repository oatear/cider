import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Document } from '../data-services/types/document.type';
import { DocumentsService } from '../data-services/services/documents.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {
  editorOptions: any = {theme: 'vs-dark-extended', language: 'markdown', automaticLayout: true};
  textDocument: Document = {
    name: "README",
    content: "# This is a sample readme document"
  } as Document;
  disablePanels: boolean = false;
  templateChanges: Subject<boolean>;

  constructor(private route: ActivatedRoute,
    private documentsService: DocumentsService,
  ) {
    this.route.paramMap.subscribe(params => {
        const documentIdString = params.get('documentId') || '';
        const documentId = parseInt(documentIdString, 10);
        // if (!isNaN(documentId)) {
        //   this.documentsService.get(documentId).then((textDocument) => {
        //     this.textDocument = textDocument;
        //   }).catch(error => {
        //     console.error(`Error fetching document with ID ${documentId}:`, error);
        //   });
        // } else {
        //   // open up the README file
        // }
    });
    this.templateChanges = new Subject();
  }
    
  public save(entity : Document) {
    // const id = (<any>this.textDocument)[this.documentsService?.getIdField()];
    // if (id) {
    //   this.updateExisting(id, this.textDocument);
    // }
  }

  public updateExisting(id: number, entity: Document) {
    this.documentsService?.update(id, entity).then(result => {}).catch(error => {});
  }

  public debounceSave() {
    this.templateChanges.next(true);
  }


  public onResizeStart(event: any) {
    this.disablePanels = true;
  }

  public onResizeEnd(event: any) {
    this.disablePanels = false;
  }

}
