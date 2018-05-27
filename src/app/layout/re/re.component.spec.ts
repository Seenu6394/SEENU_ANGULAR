import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReComponent } from './re.component';

describe('ReComponent', () => {
  let component: ReComponent;
  let fixture: ComponentFixture<ReComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
