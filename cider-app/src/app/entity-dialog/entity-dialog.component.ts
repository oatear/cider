import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityField } from '../data-services/types/entity-field.type';
import { EntityService } from '../data-services/types/entity-service.type';

@Component({
  selector: 'app-entity-dialog',
  templateUrl: './entity-dialog.component.html',
  styleUrls: ['./entity-dialog.component.scss']
})
export class EntityDialogComponent<Entity, Identifier> implements OnInit {
  @Input() service: EntityService<Entity, Identifier> | undefined;
  @Input() columns: EntityField<Entity>[] = [];
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  entity: Entity = {} as Entity;
  loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.service?.getFields().then(fields => this.columns = fields);
  }

  public save() {
    this.loading = true;
    this.service?.create(this.entity).then(result => {
      this.loading = false;
      this.hideDialog();
    }).catch(error => {
      this.loading = false;
    });
  }

  public hideDialog() {
    this.entity = {} as Entity;
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
