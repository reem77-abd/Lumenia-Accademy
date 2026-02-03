import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";

import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { TopbarComponent } from "../../shared/components/topbar/topbar.component";
import { UserService } from "../../core/services/user.service";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.css"],
})
export class MainLayoutComponent {
  private userService = inject(UserService);

  // ✅ now safe (service already created before field init)
  user = this.userService.user;

  sidebarOpen = true;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
