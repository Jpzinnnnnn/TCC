import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
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

    // Aqui será chamada a API de autenticação.
    this.mensagem =
      'Formulário validado. O acesso ao painel será disponibilizado após a integração com o servidor.';
  }
}