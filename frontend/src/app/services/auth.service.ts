import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessao = signal(false);

  readonly autenticado = this.sessao.asReadonly();

  entrar(email: string, senha: string): boolean {
    // Apenas para demonstrar o fluxo enquanto não temos backend.
    const valido =
      email.trim().toLowerCase() === 'admin@escola.com' &&
      senha === 'Admin123!';

    this.sessao.set(valido);

    return valido;
  }

  sair(): void {
    this.sessao.set(false);
  }
}