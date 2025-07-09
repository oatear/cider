import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityField } from '../data-services/types/entity-field.type';
import { DocumentsService } from '../data-services/services/documents.service';
import { Subject } from 'rxjs';
import { Document } from '../data-services/types/document.type';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit, OnDestroy {
  private destroyed$: Subject<boolean> = new Subject();
  cols: EntityField<Document>[] = [];
  documents: Document[] = [];

  constructor(public documentsService: DocumentsService) {
    this.cols = [];
    this.documents = [];
  }

  ngOnInit(): void {
      this.documentsService.getAll().then(documents => this.documents = documents);
      this.documentsService.getFields().then(fields => this.cols = fields);
  }

  ngOnDestroy(): void {
      this.destroyed$.next(true);
      this.destroyed$.complete();
  }
}
