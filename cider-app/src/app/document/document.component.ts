import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Document } from '../data-services/types/document.type';
import { DocumentsService } from '../data-services/services/documents.service';
import { debounceTime, Subject } from 'rxjs';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent implements OnInit {
  editorOptions: any = { theme: 'vs-dark-extended', language: 'markdown', 
    automaticLayout: true, minimap: { enabled: false } };
  textDocument: Document = {
    name: "",
    content: ""
  } as Document;
  disablePanels: boolean = false;
  documentChanges: Subject<boolean>;

  constructor(private route: ActivatedRoute,
    private localStorage: LocalStorageService,
    private documentsService: DocumentsService,
  ) {
    this.route.paramMap.subscribe(params => {
        const documentIdString = params.get('documentId') || '';
        const documentId = parseInt(documentIdString, 10);
        if (!isNaN(documentId)) {
          this.documentsService.get(documentId).then((textDocument) => {
            this.textDocument = textDocument;
          }).catch(error => {
            console.error(`Error fetching document with ID ${documentId}:`, error);
          });
        } else {
          this.textDocument = {
            name: "New Document",
            content: ""
          } as Document;
        }
    });
    this.documentChanges = new Subject();
    if (!this.localStorage.getDarkMode()) {
      this.editorOptions.theme = 'vs';
    }
  }

  ngOnInit(): void {
    this.documentChanges.asObservable().pipe(debounceTime(1000))
      .subscribe(() => this.save(this.textDocument));
  }
    
  public save(entity : Document) {
    const id = (<any>this.textDocument)[this.documentsService?.getIdField()];
    if (id) {
      this.updateExisting(id, this.textDocument);
    }
  }

  public updateExisting(id: number, entity: Document) {
    this.documentsService?.update(id, entity).then(result => {}).catch(error => {});
  }

  public debounceSave() {
    this.documentChanges.next(true);
  }


  public onResizeStart(event: any) {
    this.disablePanels = true;
  }

  public onResizeEnd(event: any) {
    this.disablePanels = false;
  }

}
