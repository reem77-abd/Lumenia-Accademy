import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
})
export class MainLayoutComponent implements OnInit {
  constructor(private auth: AuthService, private token: TokenService) {}

  async ngOnInit() {
    if (this.token.get()) {
      try {
        await this.auth.me();
      } catch {
        // interceptor 401 will handle redirect
      }
    }
  }
}
