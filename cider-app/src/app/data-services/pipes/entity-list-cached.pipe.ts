import { Pipe, PipeTransform } from '@angular/core';
import { EntityService } from '../types/entity-service.type';

@Pipe({
    name: 'entityListCached',
    standalone: false
})
export class EntityListCachedPipe implements PipeTransform {

  async transform(service: EntityService<any, any>, cache: Map<EntityService<any, any>, any[]>): Promise<any[] | undefined> {
    if (!cache) {
      return service.getAll();
    }

    const options = cache.get(service);
    if (!options && service) {
      const takenOptions = await service.getAll();
      cache.set(service, takenOptions);
      console.log('setOptionsCache', takenOptions);
      return takenOptions;
    }
    return options;
  }

}
