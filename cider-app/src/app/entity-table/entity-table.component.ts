import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';
import { FieldType } from '../data-services/types/field-type.type';
import { SortDirection } from '../data-services/types/search-sort.type';
import XlsxUtils from '../shared/utils/xlsx-utils';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EntityTableComponent<Entity, Identifier extends string | number> implements OnInit {

  @Input() records: Entity[] = [];
  @Input() columns: EntityField<Entity>[] = [];
  @Input() service: EntityService<Entity, Identifier> | undefined;
  @Input() selection: Entity | Entity[] | undefined;
  @Input() selectionMode: string | undefined;
  @Input() allowImportExport: boolean = false;
  @Input() allowEditing: boolean = true;
  @Input() showColumnFilters: boolean = true;
  @Input() lazy: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showInlineEditor: boolean = true;
  @Input() saveToService: boolean = true;
  @Output() selectionChange: EventEmitter<Entity | Entity[] | undefined> = new EventEmitter<Entity | Entity[] | undefined>();
  FieldType = FieldType;
  total: number = 0;
  loading: boolean = false;
  dialogVisible: boolean = false;
  entity: Entity = {} as Entity;
  idField?: string;
  lookups: Map<EntityService<any, string | number>, Map<string | number, string>> = new Map();
  importVisible: boolean = false;
  importFile: File | undefined = undefined;
  saveSubject: Subject<Entity> = new Subject();

  constructor(private messageService: MessageService, 
    private confirmationService: ConfirmationService) {
      this.saveSubject.asObservable().pipe(debounceTime(1000))
      .subscribe((entity) => this.save(entity));
  }

  ngOnInit(): void {
    this.service?.getFields().then(fields => this.columns = fields);
    this.service?.getLookups().then(lookups => this.lookups = lookups);
    if (this.lazy) {
      this.service?.search({offset: 0, limit: 10}).then(result => {
        this.total = result.total;
        this.records = result.records;
      });
    } else if (this.records) {
      this.total = this.records.length;
    }
    this.idField = this.service?.getIdField();
  }

  /**
   * Reload data whenever search/sort/filter/pagination
   * is initiated on the table
   * 
   * @param event 
   */
  public loadData(event: LazyLoadEvent) {
    this.service?.search({
      offset: 0, 
      limit: 100,
      sorting: !event.sortField ? undefined : [{
        field: event.sortField,
        direction: event.sortOrder !== undefined && event.sortOrder > 0 
          ? SortDirection.asc : SortDirection.desc
      }],
      filters: Object.entries(event.filters || {})
        .filter(([key, value]) => value.value !== null && key !== 'global')
        .map(([key, value]) => {
          return {field: key, filter: value.value}
        }),
      query: event.globalFilter
    }).then(result => {
      this.total = result.total;
      this.records = result.records;
    });
  }

  public filterGlobal(table: Table, event: any) {
    table.filterGlobal(event.target.value, 'contains');
  }

  public clear(table: Table) {
    table.clear();
  }

  public uploadFile(event: any) {
    if (event?.currentFiles?.length) {
      this.importFile = event.files[0];
    }
  }

  public openImportDialog() {
    this.importVisible = true;
  }

  public closeImportDialog() {
    this.importVisible = false;
  }

  public confirmImport(table: Table) {
    console.log('upload data');
    if (this.importFile) {
      XlsxUtils.entityImport(this.columns, this.lookups, this.importFile).then(entities => {
        this.service?.deleteAll().then(completed => {
          Promise.all(entities.map(entity => this.service?.create(entity))).then(completed => {
            this.importVisible = false;
            this.clear(table);
          });
        });
      });
    }
  }

  public exportData() {
    XlsxUtils.entityExportToFile(this.columns, this.lookups, this.records);
  }

  public debounceSave(entity: Entity) {
    this.saveSubject.next(entity);
  }

  public save(entity: Entity) {
    if (!this.service || !this.saveToService) {
      return;
    }
    const id = (<any>entity)[this.service?.getIdField()];
    this.updateExisting(id, entity);
  }
  
  public updateExisting(id: Identifier, entity: Entity) {
    this.service?.update(id, entity).then(result => {
    }).catch(error => {
      console.log('error saving entity', error);
    });
  }

  public openCreateNew() {
    this.entity = {} as Entity;
    this.dialogVisible = true;
  }

  public openEditDialog(entity : Entity) {
    this.entity = entity;
    this.dialogVisible = true;
  }

  public openDeleteDialog(entity : Entity, table: Table) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entity?',
      header: 'Delete Entity',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service?.delete((<any>entity)[this.service?.getIdField()]).then(deleted => {
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
          this.clear(table);
        });
      }
    });
  }
}
