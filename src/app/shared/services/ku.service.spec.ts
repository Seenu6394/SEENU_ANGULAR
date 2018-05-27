import { TestBed, inject } from '@angular/core/testing';

import { KuService } from './ku.service';

describe('KuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KuService]
    });
  });

  it('should be created', inject([KuService], (service: KuService) => {
    expect(service).toBeTruthy();
  }));
});
