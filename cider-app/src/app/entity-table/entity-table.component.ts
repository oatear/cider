import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';
import { FieldType } from '../data-services/types/field-type.type';
import { SortDirection } from '../data-services/types/search-sort.type';
import XlsxUtils from '../shared/utils/xlsx-utils';
import { Subject, debounceTime } from 'rxjs';
import { TableStat, TokenStat } from './table-stat.type';

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
  @Input() selectionMode: 'single' | 'multiple' | undefined;
  @Input() allowImportExport: boolean = false;
  @Input() allowEditing: boolean = true;
  @Input() showColumnFilters: boolean = true;
  @Input() lazy: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showInlineEditor: boolean = true;
  @Input() showStats: boolean = false;
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
  statsVisible: boolean = false;
  stats: TableStat[] = [];
  statsTopX: number = 20;
  importFile: File | undefined = undefined;
  saveSubject: Subject<Entity> = new Subject();
  optionsCache: Map<EntityService<any, string | number>, any[]>;

  constructor(private messageService: MessageService, 
    private confirmationService: ConfirmationService) {
      this.saveSubject.asObservable().pipe(debounceTime(1000))
        .subscribe((entity) => this.save(entity));
      this.optionsCache = new Map<EntityService<any, string | number>, any[]>();
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
  public loadData(event: TableLazyLoadEvent) {
    this.service?.search({
      offset: 0, 
      limit: 100,
      sorting: !event.sortField  || (Array.isArray(event.sortField) && event.sortField.length <= 0) ? undefined : [{
        field: Array.isArray(event.sortField) ? event.sortField[0] : event.sortField,
        direction: event.sortOrder !== undefined && event.sortOrder !== null && event.sortOrder > 0 
          ? SortDirection.asc : SortDirection.desc
      }],
      filters: Object.entries(event.filters || {})
        .filter(([key, value]) => key !== 'global' && value !== undefined 
          && (Array.isArray(value) && value.length > 0 && value[0].value != null || !Array.isArray(value) &&value.value !== null))
        .map(([key, value]) => {
          return {field: key, filter: Array.isArray(value) ? value[0].value : value?.value}
        }),
      query: !event.globalFilter ? undefined : Array.isArray(event.globalFilter) 
        ? (event.globalFilter.length > 0 ? event.globalFilter[0] : undefined) : event.globalFilter
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

  public openStatsDialog() {
    // calculate the stats
    //
    // field-name:
    //   token-name   token-count    token-copies-count
    //   token-name-2 token-count-2  token-copies-count-2
    //   ...
    // ...
    // 
    // text = 'text',
    // textArea = 'text-area',
    // number = 'number',
    // file = 'file',
    // option = 'option',
    // optionList = 'optionList'
    //
    const stats = this.columns.filter(column => !column.hidden).map(column => {
      const tokenStats = new Map<string, TokenStat>();
      this.records.forEach(record => {
        const copies = (record as any)['count'] || 1;
        const value = record[column.field];
        if (value) {
          const strValue = '' + value;
          strValue.replace(/[<][^>]*[>]/g, '').split(/ |\n|\r/).filter(str => str).forEach(token => {
            const tokenStat = tokenStats.get(token);
            if (tokenStat) {
              tokenStats.set(token, 
                {token: token, count: tokenStat.count + 1, 
                  copiesCount: tokenStat.copiesCount + copies} as TokenStat);
            } else if (tokenStats.size < this.statsTopX) {
              tokenStats.set(token, 
                {token: token, count: 1, copiesCount: copies} as TokenStat);
            }
          });
        }
      });
      const tokens = Array.from(tokenStats.values()).sort((a, b) => b.count - a.count);
      console.log('tokens:', tokens);
      return {
        header: column.header,
        tokens: tokens
      } as TableStat;
    });
    this.stats = stats;
    this.statsVisible = true;
  }

  public closeStatsDialog() {
    this.statsVisible = false;
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
