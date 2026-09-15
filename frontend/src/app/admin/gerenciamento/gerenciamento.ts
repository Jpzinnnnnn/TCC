import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-gerenciamento',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gerenciamento.html',
  styleUrl: './gerenciamento.scss',
})
export class Gerenciamento {
  private readonly rota = inject(ActivatedRoute);

  get titulo(): string {
    return this.rota.snapshot.data['titulo'];
  }
}