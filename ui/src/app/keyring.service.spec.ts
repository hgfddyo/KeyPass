import { TestBed, inject } from '@angular/core/testing';

import { KeyringService } from './keyring.service';

describe('KeyringService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyringService]
    });
  });

  it('should be created', inject([KeyringService], (service: KeyringService) => {
    expect(service).toBeTruthy();
  }));
});
