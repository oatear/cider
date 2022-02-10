import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';

@Component({
  selector: 'app-entity-dialog',
  templateUrl: './entity-dialog.component.html',
  styleUrls: ['./entity-dialog.component.scss'],
  providers: [MessageService]
})
export class EntityDialogComponent<Entity, Identifier extends string | number> implements OnInit {
  @Input() service: EntityService<Entity, Identifier> | undefined;
  @Input() columns: EntityField<Entity>[] = [];
  @Input() visible: boolean = false;
  @Input() entity: Entity = {} as Entity;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  loading: boolean = false;

  constructor(private messageService: MessageService) { }

  ngOnInit(): void {
    this.service?.getFields().then(fields => this.columns = fields);
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

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
