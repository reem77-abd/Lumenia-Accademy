import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

type PublicRole = 'STUDENT' | 'TEACHER';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role: PublicRole = 'STUDENT';

  loading = false;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  async submit() {
    this.error = null;
    this.loading = true;

    try {
      // 1) Register (public: only student/teacher)
      await firstValueFrom(
        this.api.post('/api/auth/register', {
          name: this.name.trim(),
          email: this.email.trim(),
          password: this.password,
          role: this.role,
        })
      );

      // 2) Auto-login (saves token + user via AuthService)
      const res = await this.auth.login({
        email: this.email.trim(),
        password: this.password,
      });

      // 3) Redirect by role (should be student/teacher only)
      const r = res.user.role;
      if (r === 'TEACHER') this.router.navigate(['/teacher/dashboard']);
      else this.router.navigate(['/student/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error?.message || e?.error?.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}
