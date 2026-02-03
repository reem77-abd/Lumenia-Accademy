import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UserService } from "../../core/services/user.service";


@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"],
})
export class ProfileComponent {
  private userService = inject(UserService);

  user = this.userService.user;

  currentPassword = "";
  newPassword = "";
  confirmPassword = "";

  saving = signal(false);
  message = signal<string | null>(null);

  save(): void {
    this.message.set("Password changes are coming soon.");
  }

  canSubmit(): boolean {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) return false;
    return this.newPassword === this.confirmPassword;
  }
}
