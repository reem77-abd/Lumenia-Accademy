import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../config/env';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${env.API_BASE_URL}${path}`);
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${env.API_BASE_URL}${path}`, body);
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${env.API_BASE_URL}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${env.API_BASE_URL}${path}`);
  }
}
