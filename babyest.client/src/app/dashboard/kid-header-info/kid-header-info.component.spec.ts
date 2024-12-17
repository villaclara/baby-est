import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KidHeaderInfoComponent } from './kid-header-info.component';

describe('KidHeaderInfoComponent', () => {
  let component: KidHeaderInfoComponent;
  let fixture: ComponentFixture<KidHeaderInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KidHeaderInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KidHeaderInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
