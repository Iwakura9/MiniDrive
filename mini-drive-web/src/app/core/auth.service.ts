import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'minidrive-session';
  readonly session = signal<AuthResponse | null>(this.readSession());
  constructor(private readonly http: HttpClient) {}
  login(username: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { username, password }).pipe(tap((session) => { sessionStorage.setItem(this.key, JSON.stringify(session)); this.session.set(session); }));
  }
  logout() { sessionStorage.removeItem(this.key); this.session.set(null); }
  token() { return this.session()?.accessToken ?? null; }
  private readSession(): AuthResponse | null { try { const value = sessionStorage.getItem(this.key); return value ? JSON.parse(value) as AuthResponse : null; } catch { return null; } }
}
