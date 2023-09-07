import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClipzListComponent } from './clipz-list.component';

describe('ClipzListComponent', () => {
  let component: ClipzListComponent;
  let fixture: ComponentFixture<ClipzListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClipzListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClipzListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
