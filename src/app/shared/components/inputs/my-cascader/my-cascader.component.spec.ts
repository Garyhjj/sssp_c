/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MyCascaderComponent } from './my-cascader.component';

describe('MyCascaderComponent', () => {
  let component: MyCascaderComponent;
  let fixture: ComponentFixture<MyCascaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyCascaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCascaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
