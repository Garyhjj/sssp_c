/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataDriveService } from './data-drive.service';

describe('Service: DataDrive', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataDriveService],
    });
  });

  it(
    'should ...',
    inject([DataDriveService], (service: DataDriveService) => {
      expect(service).toBeTruthy();
    }),
  );
});
