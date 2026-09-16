import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({ selector: 'app-login', imports: [ReactiveFormsModule], templateUrl: './login.html', styleUrl: './login.css' })
export class Login {
  readonly loading = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({ username: new FormControl('', { nonNullable: true, validators: [Validators.required] }), password: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  constructor(private readonly auth: AuthService, private readonly router: Router) { if (auth.token()) void router.navigateByUrl('/files'); }
  submit() { if (this.form.invalid || this.loading()) return; this.loading.set(true); this.error.set(''); const { username, password } = this.form.getRawValue(); this.auth.login(username, password).subscribe({ next: () => void this.router.navigateByUrl('/files'), error: () => { this.error.set('Usuário ou senha inválidos.'); this.loading.set(false); } }); }
}
