import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleActivityComponent } from './single-activity.component';

describe('SingleActivityComponent', () => {
  let component: SingleActivityComponent;
  let fixture: ComponentFixture<SingleActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
