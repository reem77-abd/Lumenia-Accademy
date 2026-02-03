import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // If you're using a proxy, keep baseUrl = ''.
  // If not, set it to your backend: 'http://localhost:4000'
  private baseUrl = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

get<T>(path: string, params?: Record<string, any>): Observable<T> {
  const headers = new HttpHeaders({
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  });

  return this.http.get<T>(this.baseUrl + path, {
    params: this.toParams(params),
    headers,
  });
}

  post<T>(path: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.post<T>(this.baseUrl + path, body ?? {}, {
      params: this.toParams(params),
    });
  }

  patch<T>(path: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.patch<T>(this.baseUrl + path, body ?? {}, {
      params: this.toParams(params),
    });
  }

  // ✅ ADD THIS (so services can use api.put)
  put<T>(path: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.put<T>(this.baseUrl + path, body ?? {}, {
      params: this.toParams(params),
    });
  }

  delete<T>(path: string, params?: Record<string, any>): Observable<T> {
    return this.http.delete<T>(this.baseUrl + path, {
      params: this.toParams(params),
    });
  }

  private toParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
