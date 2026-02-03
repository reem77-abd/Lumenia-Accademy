import { Component, EventEmitter, Output, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { UserService } from "../../../core/services/user.service";

@Component({
  selector: "app-topbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./topbar.component.html",
})
export class TopbarComponent {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  // ✅ keep your existing pattern
  user = this.userService.user;

  // ✅ NEW: let MainLayout listen to this to toggle sidebar
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  goProfile() {
    this.router.navigate(["/profile"]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
