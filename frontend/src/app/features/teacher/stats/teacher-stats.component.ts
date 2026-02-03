import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { TeacherStatsService } from "../../../core/services/teacher-stats.service";
import { TeacherStats } from "../../../core/models/stats.model";

@Component({
  selector: "app-teacher-stats",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./teacher-stats.component.html",
  styleUrls: ["./teacher-stats.component.css"],
})
export class TeacherStatsComponent implements OnInit {
  loading = false;
  error: string | null = null;
  stats: TeacherStats | null = null;

  constructor(private statsService: TeacherStatsService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;

    this.statsService.getMe().subscribe({
      next: (s) => {
        this.stats = s;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = "Could not load stats.";
      },
    });
  }
}
