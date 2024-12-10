import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigningpageComponent } from './signingpage.component';

describe('SigningpageComponent', () => {
  let component: SigningpageComponent;
  let fixture: ComponentFixture<SigningpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SigningpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigningpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
