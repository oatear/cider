import { Component, Input, OnInit, Output } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { EntityField } from '../data-services/types/entity-field.type';

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class EntityTableComponent<Entity> implements OnInit {

  @Input() total: number = 0;
  @Input() records: Entity[] = [];
  @Input() columns: EntityField<Entity>[] = [];
  @Output() selectedEntity: Entity | undefined;
  loading: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Reload data whenever search/sort/filter/pagination
   * is initiated on the table
   * 
   * @param event 
   */
  public loadData(event: LazyLoadEvent) {
    // load data through search promise
  }
}
