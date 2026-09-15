import { Injectable, signal } from '@angular/core';

export interface RefeicaoCardapio {
  id: string;
  titulo: string;
  horario: string;
  mensagem: string;
  opcoes: string[];
}

export interface DiaSemana {
  nome: string;
  data: string;
  titulo: string;
}

export type SelecaoDia = Record<string, string[]>;
export type SelecaoSemana = SelecaoDia[];

function copiar(semana: SelecaoSemana): SelecaoSemana {
  return semana.map(dia =>
    Object.fromEntries(
      Object.entries(dia).map(([id, alimentos]) => [id, [...alimentos]]),
    ),
  );
}

@Injectable({ providedIn: 'root' })
export class CardapioService {
  readonly dias: DiaSemana[] = [
    {
      nome: 'Segunda',
      data: '24/08',
      titulo: 'Segunda-feira, 24 de Agosto de 2026',
    },
    {
      nome: 'Terça',
      data: '25/08',
      titulo: 'Terça-feira, 25 de Agosto de 2026',
    },
    {
      nome: 'Quarta',
      data: '26/08',
      titulo: 'Quarta-feira, 26 de Agosto de 2026',
    },
    {
      nome: 'Quinta',
      data: '27/08',
      titulo: 'Quinta-feira, 27 de Agosto de 2026',
    },
    {
      nome: 'Sexta',
      data: '28/08',
      titulo: 'Sexta-feira, 28 de Agosto de 2026',
    },
  ];

  readonly refeicoes: RefeicaoCardapio[] = [
    {
      id: 'manha',
      titulo: 'Café da Manhã',
      horario: '09h10 - 09h40',
      mensagem: 'Energia para começar o dia com disposição!',
      opcoes: [
        'Leite com achocolatado',
        'Pão com manteiga',
        'Fruta da estação',
        'Biscoito cream cracker',
        'Pão com geleia',
        'Iogurte natural',
        'Cereal matinal',
        'Mingau de aveia',
        'Bolo simples',
        'Suco de fruta',
      ],
    },
    {
      id: 'almoco',
      titulo: 'Almoço',
      horario: '11h20 - 12h40',
      mensagem: 'Refeição equilibrada para mais saúde e aprendizado!',
      opcoes: [
        'Arroz branco',
        'Feijão carioca',
        'Frango assado',
        'Salada verde',
        'Carne moída',
        'Legumes refogados',
        'Macarrão ao sugo',
        'Purê de batata',
        'Suco de laranja natural',
        'Farofa',
      ],
    },
    {
      id: 'tarde',
      titulo: 'Café da Tarde',
      horario: '14h20 - 14h50',
      mensagem: 'Sabor e energia para finalizar o dia com alegria!',
      opcoes: [
        'Suco de frutas',
        'Bolo caseiro',
        'Biscoito maizena',
        'Fruta',
        'Pão com queijo',
        'Vitamina de banana',
        'Rosquinha',
        'Pipoca',
        'Gelatina',
        'Chá com biscoito',
      ],
    },
  ];

  private readonly inicial: SelecaoSemana = this.dias.map(() =>
    Object.fromEntries(
      this.refeicoes.map(refeicao => [
        refeicao.id,
        refeicao.opcoes.slice(0, 4),
      ]),
    ),
  );

  private readonly rascunho = signal(copiar(this.inicial));
  private readonly salvo = signal(copiar(this.inicial));
  private readonly publicado = signal(copiar(this.inicial));

  readonly semanaPublicada = this.publicado.asReadonly();

  selecionado(dia: number, refeicao: string, alimento: string): boolean {
    return this.rascunho()[dia][refeicao].includes(alimento);
  }

  alterar(
    dia: number,
    refeicao: string,
    alimento: string,
    marcado: boolean,
  ): void {
    this.rascunho.update(semana => {
      const nova = copiar(semana);
      const itens = nova[dia][refeicao];

      nova[dia][refeicao] = marcado
        ? [...new Set([...itens, alimento])]
        : itens.filter(item => item !== alimento);

      return nova;
    });
  }

  temAlteracoes(dia: number, refeicao: string): boolean {
    const atual = [...this.rascunho()[dia][refeicao]].sort();
    const salvo = [...this.salvo()[dia][refeicao]].sort();

    return JSON.stringify(atual) !== JSON.stringify(salvo);
  }

  salvar(dia: number, refeicao: string): boolean {
    const itens = this.rascunho()[dia][refeicao];

    if (!itens.length) {
      return false;
    }

    this.salvo.update(semana => {
      const nova = copiar(semana);
      nova[dia][refeicao] = [...itens];
      return nova;
    });

    return true;
  }

  publicar(): boolean {
    const pendente = this.dias.some((_, dia) =>
      this.refeicoes.some(refeicao => this.temAlteracoes(dia, refeicao.id)),
    );

    if (pendente) {
      return false;
    }

    this.publicado.set(copiar(this.salvo()));
    return true;
  }

  adicionarAlimento(refeicaoId: string, nome: string): string | null {
    const refeicao = this.refeicoes.find(item => item.id === refeicaoId);
    const alimento = nome.trim().replace(/\s+/g, ' ');

    if (!refeicao) {
      return 'Refeição não encontrada.';
    }

    if (!alimento) {
      return 'Digite o nome do alimento.';
    }

    if (alimento.length > 80) {
      return 'Use até 80 caracteres.';
    }

    const normalizar = (texto: string) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const existe = refeicao.opcoes.some(
      item => normalizar(item) === normalizar(alimento),
    );

    if (existe) {
      return 'Esse alimento já está na lista.';
    }

    refeicao.opcoes = [...refeicao.opcoes, alimento];

    return null;
  }
}