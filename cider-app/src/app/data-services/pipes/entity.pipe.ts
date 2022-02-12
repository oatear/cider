import { Pipe, PipeTransform } from '@angular/core';
import { EntityService } from '../types/entity-service.type';

/**
 * Pipe an entity ID into that entity given a service
 */
@Pipe({
  name: 'entity'
})
export class EntityPipe implements PipeTransform {

  transform(entityId: unknown, service: EntityService<any, any>): Promise<any> {
    return service.get(entityId);
  }

}
