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

  transform(entityId: unknown, service: EntityService<any, any>): Promise<string> {
    if (!entityId || !service) {
      return new Promise<any>((resolve, reject) => {
        resolve('');
      });
    }
    return service.get(entityId).then(entity => service.getEntityName(entity));
  }

}
