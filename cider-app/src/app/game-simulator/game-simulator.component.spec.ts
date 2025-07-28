import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSimulatorComponent } from './game-simulator.component';

describe('GameSimulatorComponent', () => {
  let component: GameSimulatorComponent;
  let fixture: ComponentFixture<GameSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSimulatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
