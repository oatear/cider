import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetGeneratorComponent } from './asset-generator.component';

describe('AssetGeneratorComponent', () => {
  let component: AssetGeneratorComponent;
  let fixture: ComponentFixture<AssetGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
