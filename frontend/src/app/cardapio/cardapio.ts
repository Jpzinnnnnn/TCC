import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Refeicao {
  titulo: string;
  horario: string;
  icone: string;
  alimentos: string[];
  mensagem: string;
}

interface DiaCardapio {
  nome: string;
  data: string;
  titulo: string;
  refeicoes: Refeicao[];
}

function criarRefeicoes(
  cafe: string[],
  almoco: string[],
  tarde: string[],
): Refeicao[] {
  return [
    {
      titulo: 'Café da Manhã',
      horario: '09h10 - 09h40',
      icone: '☕',
      alimentos: cafe,
      mensagem: 'Energia para começar o dia com disposição!',
    },
    {
      titulo: 'Almoço',
      horario: '11h20 - 12h40',
      icone: '♜',
      alimentos: almoco,
      mensagem: 'Refeição equilibrada para mais saúde e aprendizado!',
    },
    {
      titulo: 'Café da Tarde',
      horario: '14h20 - 14h50',
      icone: '☕',
      alimentos: tarde,
      mensagem: 'Sabor e energia para finalizar o dia com alegria!',
    },
  ];
}

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio {
  // Começa na quarta-feira, como no protótipo.
  diaSelecionado = 2;

  readonly dias: DiaCardapio[] = [
    {
      nome: 'Segunda',
      data: '24/08',
      titulo: 'Segunda-feira, 24 de Agosto de 2026',
      refeicoes: criarRefeicoes(
        ['Leite com achocolatado', 'Pão com manteiga', 'Banana'],
        [
          'Arroz branco',
          'Feijão carioca',
          'Carne moída',
          'Salada de alface',
          'Cenoura refogada',
          'Maçã',
        ],
        ['Chá', 'Bolo de cenoura', 'Fruta da estação'],
      ),
    },
    {
      nome: 'Terça',
      data: '25/08',
      titulo: 'Terça-feira, 25 de Agosto de 2026',
      refeicoes: criarRefeicoes(
        ['Leite', 'Pão com queijo', 'Mamão'],
        [
          'Arroz branco',
          'Feijão carioca',
          'Frango ao molho',
          'Salada de tomate',
          'Abobrinha refogada',
          'Laranja',
        ],
        ['Leite com achocolatado', 'Biscoito salgado', 'Banana'],
      ),
    },
    {
      nome: 'Quarta',
      data: '26/08',
      titulo: 'Quarta-feira, 26 de Agosto de 2026',
      refeicoes: criarRefeicoes(
        ['Leite com achocolatado', 'Pão com manteiga', 'Fruta da estação'],
        [
          'Arroz branco',
          'Feijão carioca',
          'Frango assado',
          'Salada verde',
          'Legumes refogados',
          'Fruta',
        ],
        ['Leite com achocolatado', 'Bolo caseiro', 'Fruta da estação'],
      ),
    },
    {
      nome: 'Quinta',
      data: '27/08',
      titulo: 'Quinta-feira, 27 de Agosto de 2026',
      refeicoes: criarRefeicoes(
        ['Leite com achocolatado', 'Pão com manteiga', 'Maçã'],
        [
          'Arroz branco',
          'Feijão preto',
          'Carne de panela',
          'Salada de repolho',
          'Abóbora refogada',
          'Banana',
        ],
        ['Chá de erva-doce', 'Pão com queijo', 'Mamão'],
      ),
    },
    {
      nome: 'Sexta',
      data: '28/08',
      titulo: 'Sexta-feira, 28 de Agosto de 2026',
      refeicoes: criarRefeicoes(
        ['Leite', 'Bolo caseiro', 'Banana'],
        [
          'Arroz branco',
          'Feijão carioca',
          'Omelete de legumes',
          'Salada de alface e tomate',
          'Batata assada',
          'Melancia',
        ],
        ['Leite com achocolatado', 'Pão com manteiga', 'Fruta da estação'],
      ),
    },
  ];

  get diaAtual(): DiaCardapio {
    return this.dias[this.diaSelecionado];
  }

  selecionarDia(indice: number): void {
    if (indice >= 0 && indice < this.dias.length) {
      this.diaSelecionado = indice;
    }
  }

  mudarDia(direcao: number): void {
    this.selecionarDia(this.diaSelecionado + direcao);
  }
}