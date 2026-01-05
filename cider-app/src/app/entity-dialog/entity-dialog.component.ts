import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';
import { FieldType } from '../data-services/types/field-type.type';
import { TranslateService } from '@ngx-translate/core';
import TranslateUtils from '../shared/utils/translate-utils';

@Component({
    selector: 'app-entity-dialog',
    templateUrl: './entity-dialog.component.html',
    styleUrls: ['./entity-dialog.component.scss'],
    providers: [MessageService],
    standalone: false
})
export class EntityDialogComponent<Entity, Identifier extends string | number> implements OnInit, OnChanges {
  @Input() service: EntityService<Entity, Identifier> | undefined;
  @Input() columns: EntityField<Entity>[] = [];
  @Input() visible: boolean = false;
  @Input() entity: Entity = {} as Entity;
  @Input() title: string = '';
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onCreate: EventEmitter<Entity> = new EventEmitter<Entity>();
  loading: boolean = false;
  FieldType = FieldType;

  constructor(private messageService: MessageService, 
    private translate: TranslateService,
    private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (this.service && this.service.getFields) {
      this.service?.getFields().then(fields => TranslateUtils.translateFields(fields, this.translate))
        .then(fields => this.columns = fields);
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['service'] && this.service && this.service.getFields) {
      this.service.getFields().then(fields => TranslateUtils.translateFields(fields, this.translate))
        .then(fields => this.columns = fields);
    }
  }

  public save() {
    if (!this.service) {
      return;
    }
    const id = (<any>this.entity)[this.service?.getIdField()];
    if (id) {
      this.updateExisting(id, this.entity);
    } else {
      this.createNew(this.entity);
    }
  }

  public createNew(entity: Entity) {
    this.loading = true;
    this.service?.create(entity).then(result => {
      this.loading = false;
      this.hideDialog();
      this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Created', life: 3000});
      this.onCreate.emit(entity);
    }).catch(error => {
      this.loading = false;
    });
  }

  public updateExisting(id: Identifier, entity: Entity) {
    this.loading = true;
    this.service?.update(id, entity).then(result => {
      this.loading = false;
      this.hideDialog();
      this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Updated', life: 3000});
    }).catch(error => {
      this.loading = false;
    });
  }

  public uploadFile(entity: Entity, field: string | number | symbol, event: any) {
    if (event?.currentFiles?.length) {
      (<any>entity)[field] = event.files[0];
    }
  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
