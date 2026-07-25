import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoveeMeComponent } from './lovee-me.component';

describe('LoveeMeComponent', () => {
  let component: LoveeMeComponent;
  let fixture: ComponentFixture<LoveeMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoveeMeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoveeMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
