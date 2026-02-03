import { Component, inject } from '@angular/core';
import { Location, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './unauthorized.component.html',
})
export class UnauthorizedComponent {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
