/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MxSelectComponent } from './mx-select.component';

describe('MxSelectComponent', () => {
  let component: MxSelectComponent;
  let fixture: ComponentFixture<MxSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MxSelectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MxSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
