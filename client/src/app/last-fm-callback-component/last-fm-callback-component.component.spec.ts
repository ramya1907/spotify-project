import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastFmCallbackComponentComponent } from './last-fm-callback-component.component';

describe('LastFmCallbackComponentComponent', () => {
  let component: LastFmCallbackComponentComponent;
  let fixture: ComponentFixture<LastFmCallbackComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LastFmCallbackComponentComponent]
    });
    fixture = TestBed.createComponent(LastFmCallbackComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
