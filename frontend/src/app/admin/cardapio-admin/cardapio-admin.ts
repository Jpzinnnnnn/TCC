import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';
import { CardapioService } from '../../cardapio.service';

@Component({
  selector: 'app-cardapio-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cardapio-admin.html',
  styleUrl: './cardapio-admin.scss',
})
export class CardapioAdmin {
  readonly cardapio = inject(CardapioService);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  diaSelecionado = 2;
  mensagem = '';
  tituloInformacao = '';
  erro = false;

  adicionandoRefeicao: string | null = null;
  erroAlimento = '';

  get diaAtual() {
    return this.cardapio.dias[this.diaSelecionado];
  }

  selecionarDia(indice: number): void {
    if (indice < 0 || indice >= this.cardapio.dias.length) {
      return;
    }

    this.diaSelecionado = indice;
    this.mensagem = '';
  }

  alterar(refeicao: string, alimento: string, marcado: boolean): void {
    this.cardapio.alterar(
      this.diaSelecionado,
      refeicao,
      alimento,
      marcado,
    );

    this.mensagem = '';
  }

  salvar(refeicao: string, titulo: string): void {
    const sucesso = this.cardapio.salvar(this.diaSelecionado, refeicao);

    this.erro = !sucesso;
    this.mensagem = sucesso
      ? `${titulo} de ${this.diaAtual.nome.toLowerCase()} salvo. Publique a semana para atualizar a página pública.`
      : 'Selecione pelo menos um alimento antes de salvar.';
  }

  publicar(): void {
    const sucesso = this.cardapio.publicar();

    this.erro = !sucesso;
    this.mensagem = sucesso
      ? 'Semana publicada nesta demonstração! A página pública de Cardápio foi atualizada.'
      : 'Existem alterações não salvas. Confira os dias da semana e clique em Salvar Seleção nas refeições alteradas.';
  }

  abrirAdicionar(refeicaoId: string): void {
    this.adicionandoRefeicao = refeicaoId;
    this.erroAlimento = '';
  }

  cancelarAdicionar(): void {
    this.adicionandoRefeicao = null;
    this.erroAlimento = '';
  }

  adicionarAlimento(
    refeicaoId: string,
    campo: HTMLInputElement,
  ): void {
    const erro = this.cardapio.adicionarAlimento(
      refeicaoId,
      campo.value,
    );

    if (erro) {
      this.erroAlimento = erro;
      campo.focus();
      return;
    }

    this.cancelarAdicionar();
    this.erro = false;
    this.mensagem =
      'Alimento adicionado à lista. Marque-o nos dias desejados, salve a seleção e publique a semana.';
  }

  sair(): void {
    this.auth.sair();
    void this.router.navigateByUrl('/admin', { replaceUrl: true });
  }
}