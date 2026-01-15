import { TestBed } from '@angular/core/testing';

import { CardAttributesService } from './card-attributes.service';
import { DecksChildService } from '../indexed-db/decks-child.service';

describe('CardAttributesService', () => {
  let service: CardAttributesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardAttributesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert legacy pipe-delimited options to object format with colors', async () => {
    const entity: any = {
      type: 'dropdown',
      options: 'Option 1|Option 2|Option 3'
    };

    // spy on super.create to prevent actual DB call and check arguments
    spyOn(DecksChildService.prototype, 'create').and.returnValue(Promise.resolve(entity));

    await service.create(entity);

    expect(entity.options.length).toBe(3);
    expect(entity.options[0].value).toBe('Option 1');
    expect(entity.options[0].color).toBeDefined();
    expect(entity.options[1].value).toBe('Option 2');
    expect(entity.options[1].color).toBeDefined();
    expect(entity.options[2].value).toBe('Option 3');
    expect(entity.options[2].color).toBeDefined();
  });

  it('should not modify options if already in object format', async () => {
    const options = [{ value: 'Option 1', color: '#FFFFFF' }];
    const entity: any = {
      type: 'dropdown',
      options: options
    };

    spyOn(DecksChildService.prototype, 'create').and.returnValue(Promise.resolve(entity));

    await service.create(entity);

    expect(entity.options).toEqual(options);
  });

  it('should handle "option" as alias for dropdown type', async () => {
    const entity: any = {
      type: 'option',
      options: 'Option 1|Option 2'
    };
    spyOn(DecksChildService.prototype, 'create').and.returnValue(Promise.resolve(entity));
    await service.create(entity);
    expect(entity.options.length).toBe(2);
    expect(entity.type).toBe('dropdown');
  });

  it('should convert single string option to object format', async () => {
    const entity: any = {
      type: 'dropdown',
      options: 'Option 1'
    };
    spyOn(DecksChildService.prototype, 'create').and.returnValue(Promise.resolve(entity));
    await service.create(entity);
    expect(entity.options.length).toBe(1);
    expect(entity.options[0].value).toBe('Option 1');
    expect(entity.options[0].color).toBeDefined();
  });

  it('should parse JSON options string', async () => {
    const options = [{ value: 'Option 1', color: '#123456' }];
    const entity: any = {
      type: 'dropdown',
      options: JSON.stringify(options)
    };
    spyOn(DecksChildService.prototype, 'create').and.returnValue(Promise.resolve(entity));
    await service.create(entity);
    expect(entity.options).toEqual(options);
  });
});
