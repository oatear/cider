import { Pipe, PipeTransform } from '@angular/core';
import { EntityService } from '../types/entity-service.type';

/**
 * Given an entity ID and a service, pipe to a promise of
 * a pretty string representing that entity.
 */
@Pipe({
  name: 'entityName'
})
export class EntityNamePipe implements PipeTransform {

  transform(value: unknown, service: EntityService<any, any>): Promise<string> {
    return service.get(value).then(entity => service.getEntityName(entity));
  }

}
