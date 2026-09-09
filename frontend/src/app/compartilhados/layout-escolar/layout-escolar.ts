import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout-escolar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './layout-escolar.html',
  styleUrl: './layout-escolar.scss',
})
export class LayoutEscolar {}