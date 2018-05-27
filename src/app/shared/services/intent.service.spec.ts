import { TestBed, inject } from '@angular/core/testing';

import { IntentService } from './intent.service';

describe('IntentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntentService]
    });
  });

  it('should be created', inject([IntentService], (service: IntentService) => {
    expect(service).toBeTruthy();
  }));
});
