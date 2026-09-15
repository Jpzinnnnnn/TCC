import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-inicio-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-admin.html',
  styleUrl: './inicio-admin.scss',
})
export class InicioAdmin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.auth.sair();
    void this.router.navigateByUrl('/admin', { replaceUrl: true });
  }
}