import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-teacher-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./teacher-dashboard.component.html",
  styleUrls: ["./teacher-dashboard.component.css"],
})
export class TeacherDashboardComponent {}
