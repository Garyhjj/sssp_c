/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FilterColumnComponent } from './filter-column.component';

describe('FilterColumnComponent', () => {
  let component: FilterColumnComponent;
  let fixture: ComponentFixture<FilterColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterColumnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
