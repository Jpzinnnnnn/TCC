import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  CardapioService,
  ItemCardapio,
} from '../services/cardapio.service';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio implements OnInit {
  private readonly servico = inject(CardapioService);

  // Usa os cinco dias já calculados pelo serviço.
  readonly dias = this.servico.dias;

  // Começa na segunda-feira.
  diaSelecionado = 0;

  cardapio: ItemCardapio[] = [];

  carregando = true;
  erro = '';

  readonly refeicoes = [
    {
      id: 0,
      titulo: 'Café da manhã',
      horario: 'Café da manhã',
      mensagem:
        'Uma boa alimentação ajuda você a começar bem o dia.',
    },
    {
      id: 1,
      titulo: 'Almoço',
      horario: 'Almoço',
      mensagem:
        'Uma refeição equilibrada ajuda no aprendizado e no desenvolvimento.',
    },
    {
      id: 2,
      titulo: 'Café da tarde',
      horario: 'Café da tarde',
      mensagem:
        'Um lanche saudável para continuar o dia com energia.',
    },
  ];

  ngOnInit(): void {
    this.buscarCardapio();
  }

  buscarCardapio(): void {
    this.carregando = true;
    this.erro = '';

    this.servico.buscarTodos().subscribe({
      next: (dados: ItemCardapio[]) => {
        this.cardapio = dados;
        this.carregando = false;
      },

      error: erro => {
        console.error('Erro ao carregar cardápio:', erro);

        this.erro = 'Não foi possível carregar o cardápio.';
        this.carregando = false;
      },
    });
  }

  get diaAtual() {
    return this.dias[this.diaSelecionado];
  }

  get refeicoesDoDia() {
    const dia = this.diaAtual;

    if (!dia) {
      return [];
    }

    return this.refeicoes.map(refeicao => {
      const alimentos = this.cardapio
        .filter(
          item =>
            item.dia === dia.dataApi &&
            item.hora === refeicao.id,
        )
        .map(item => item.comida);

      return {
        ...refeicao,
        alimentos,
      };
    });
  }

  selecionarDia(indice: number): void {
    if (indice >= 0 && indice < this.dias.length) {
      this.diaSelecionado = indice;
    }
  }

  mudarDia(direcao: number): void {
    this.selecionarDia(this.diaSelecionado + direcao);
  }

  temAlimentos(alimentos: string[]): boolean {
    return alimentos.length > 0;
  }
}