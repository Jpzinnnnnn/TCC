import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardapioService } from '../services/cardapio.service';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio {
  private readonly servico = inject(CardapioService);

  diaSelecionado = 2;

  get dias() {
    const publicado = this.servico.semanaPublicada();

    return this.servico.dias.map((dia, indice) => ({
      ...dia,
      refeicoes: this.servico.refeicoes.map(refeicao => ({
        titulo: refeicao.titulo,
        horario: refeicao.horario,
        mensagem: refeicao.mensagem,
        alimentos: publicado[indice][refeicao.id],
      })),
    }));
  }

  get diaAtual() {
    return this.dias[this.diaSelecionado];
  }

  selecionarDia(indice: number): void {
    if (indice >= 0 && indice < this.servico.dias.length) {
      this.diaSelecionado = indice;
    }
  }

  mudarDia(direcao: number): void {
    this.selecionarDia(this.diaSelecionado + direcao);
  }
}