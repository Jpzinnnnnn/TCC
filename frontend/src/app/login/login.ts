import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  senha = '';
  mostrarSenha = false;
  mensagem = '';

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar(formulario: NgForm): void {
    this.mensagem = '';

    if (formulario.invalid) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.auth.entrar(this.email, this.senha).subscribe({
      next: (sucesso) => {
        if (!sucesso) {
          this.mensagem = 'E-mail ou senha incorretos.';
          return;
        }

        this.senha = '';
        void this.router.navigateByUrl('/admin/inicio');
      },
      error: () => {
        this.mensagem = 'Erro de conexão com o servidor. Tente novamente.';
      },
    });
  }
}