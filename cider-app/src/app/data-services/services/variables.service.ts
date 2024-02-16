import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { Variable, VariableCollection } from '../types/variable.type';

@Injectable({
  providedIn: 'root'
})
export class VariablesService extends IndexedDbService<Variable, number> {

  constructor(db: AppDB) {
    super(db, AppDB.VARIABLES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, description: 'The name of the variable'},
      {field: 'value', header: 'Value', type: FieldType.text, description: 'The value of the variable'},
    ]);
  }
  
  override getEntityName(entity: Variable) {
    return entity.name;
  }

  getCollection(): Promise<VariableCollection> {
    return this.getAll().then(variablesArray => {
      let collection:VariableCollection = {};
      variablesArray.forEach(variable => collection[variable.name] = variable.value);
      return collection;
    })
  }
}
