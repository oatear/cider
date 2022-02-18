import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';
import { FieldType } from '../data-services/types/field-type.type';
import { SortDirection } from '../data-services/types/search-sort.type';

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
  @Input() selection: Entity | undefined;
  @Input() selectionMode: string | undefined;
  @Output() selectionChange: EventEmitter<Entity | undefined> = new EventEmitter<Entity | undefined>();
  FieldType = FieldType;
  total: number = 0;
  loading: boolean = false;
  dialogVisible: boolean = false;
  entity: Entity = {} as Entity;
  idField?: string;

  constructor(private messageService: MessageService, 
    private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.service?.getFields().then(fields => this.columns = fields);
    this.service?.search({offset: 0, limit: 10}).then(result => {
      this.total = result.total;
      this.records = result.records;
    });
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

  public openCreateNew() {
    this.entity = {} as Entity;
    this.dialogVisible = true;
  }

  public openEditDialog(entity : Entity) {
    this.entity = entity;
    this.dialogVisible = true;
  }

  public openDeleteDialog(entity : Entity) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entity?',
      header: 'Delete Entity',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service?.delete((<any>entity)[this.service?.getIdField()]).then(deleted => {
          this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }
}
