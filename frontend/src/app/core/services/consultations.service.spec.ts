import { TestBed } from '@angular/core/testing';
import { ConsultationsService, ConsultationCreateBody } from './consultations.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('ConsultationsService', () => {
  let service: ConsultationsService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['post']);

    TestBed.configureTestingModule({
      providers: [ConsultationsService, { provide: ApiService, useValue: spy }],
    });

    service = TestBed.inject(ConsultationsService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiSpy.post.and.returnValue(of({}));
  });

  it('should POST to chapter endpoint when chapterId is present', (done) => {
    const body: ConsultationCreateBody = { courseId: 1, chapterId: 5 };
    service.create(body).subscribe(() => {
      expect(apiSpy.post).toHaveBeenCalledWith('/api/consultations/chapter/5', jasmine.anything());
      done();
    });
  });

  it('should POST to course endpoint when chapterId is not provided', (done) => {
    const body: ConsultationCreateBody = { courseId: 42 };
    service.create(body).subscribe(() => {
      expect(apiSpy.post).toHaveBeenCalledWith('/api/consultations/course/42', jasmine.anything());
      done();
    });
  });
});
