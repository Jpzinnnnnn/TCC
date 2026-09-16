import { Component, Input, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-layout-escolar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './layout-escolar.html',
  styleUrl: './layout-escolar.scss',
})
export class LayoutEscolar {
  @Input() administrativo = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.auth.sair();
    void this.router.navigateByUrl('/admin', { replaceUrl: true });
  }
}