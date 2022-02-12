import { Pipe, PipeTransform } from '@angular/core';
import { EntityService } from '../types/entity-service.type';

/**
 * Get a list of all the entities
 */
@Pipe({
  name: 'entityList'
})
export class EntityListPipe implements PipeTransform {

  transform(service: EntityService<any, any>): Promise<any[]> {
    return service.getAll();
  }

}
