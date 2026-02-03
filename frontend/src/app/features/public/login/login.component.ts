import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = null;
    this.loading = true;

    try {
      const res = await this.auth.login({
        email: this.email,
        password: this.password,
      });

      const role = res.user.role;

      if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
      else if (role === 'TEACHER') this.router.navigate(['/teacher/dashboard']);
      else this.router.navigate(['/student/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error?.message || e?.error?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
