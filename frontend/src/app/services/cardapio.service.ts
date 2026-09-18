import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

// =====================================================
// INTERFACES DOS DADOS DO CARDÁPIO
// =====================================================

export interface ItemCardapio {
  id_cardapio?: number;
  comida: string;
  fk_id_horario?: number;
  id_horario?: number;
  hora?: number;
  dia?: string;
}

export interface RespostaCardapio {
  mensagem: string;
  id_cardapio?: number;
  sucesso?: boolean;
}

export interface RefeicaoCardapio {
  id: string;
  horaIndex: number;
  titulo: string;
  horario: string;
  mensagem: string;
  opcoes: string[];
}

export interface DiaSemana {
  nome: string;
  data: string;
  titulo: string;
  dataApi: string;
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

@Injectable({
  providedIn: 'root',
})
export class CardapioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/cardapio';

  // Configuração dos 5 dias letivos da semana (Segunda a Sexta)
  readonly dias: DiaSemana[] = this.calcularDiasSemana();

  // Definição das refeições servidas
  readonly refeicoes: RefeicaoCardapio[] = [
    {
      id: 'manha',
      horaIndex: 0,
      titulo: 'Café da Manhã',
      horario: '09h10 - 09h40',
      mensagem: 'Energia para começar o dia com disposição!',
      opcoes: [
        'Leite com achocolatado',
        'Pão com manteiga',
        'Fruta da estação',
        'Biscoito cream cracker',
        'Iogurte natural',
        'Suco de fruta',
      ],
    },
    {
      id: 'almoco',
      horaIndex: 1,
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
        'Farofa',
      ],
    },
    {
      id: 'tarde',
      horaIndex: 2,
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
      ],
    },
  ];

  private readonly inicial: SelecaoSemana = this.dias.map(() =>
    Object.fromEntries(
      this.refeicoes.map(refeicao => [
        refeicao.id,
        refeicao.opcoes.slice(0, 3),
      ]),
    ),
  );

  private readonly rascunho = signal(copiar(this.inicial));
  private readonly salvo = signal(copiar(this.inicial));
  private readonly publicado = signal(copiar(this.inicial));

  readonly semanaPublicada = this.publicado.asReadonly();

  constructor() {
    this.carregarCardapioDoBackend();
    this.carregarOpcoesDoBackend();
  }

  private calcularDiasSemana(): DiaSemana[] {
    const hoje = new Date();
    const diaSemanaAtual = hoje.getDay(); // 0 = Domingo, 1 = Segunda
    const inicio = new Date(hoje);
    // Ajusta para a segunda-feira da semana
    const diff = hoje.getDate() - diaSemanaAtual + (diaSemanaAtual === 0 ? -6 : 1);
    inicio.setDate(diff);

    const nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return Array.from({ length: 5 }, (_, i) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + i);

      const diaStr = String(data.getDate()).padStart(2, '0');
      const mesStr = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();

      return {
        nome: nomes[i],
        data: `${diaStr}/${mesStr}`,
        titulo: `${nomes[i]}-feira, ${diaStr} de ${nomesMeses[data.getMonth()]} de ${ano}`,
        dataApi: `${ano}-${mesStr}-${diaStr}`,
      };
    });
  }

  // Sincroniza os itens do backend para o estado local
  private carregarCardapioDoBackend(): void {
    this.buscarTodos().subscribe({
      next: (itens) => {
        if (!itens || itens.length === 0) return;

        const novaSemana = copiar(this.rascunho());

        this.dias.forEach((dia, diaIdx) => {
          this.refeicoes.forEach((refeicao) => {
            const itensDoDia = itens
              .filter(
                (item) =>
                  item.dia === dia.dataApi && item.hora === refeicao.horaIndex,
              )
              .map((item) => item.comida);

            if (itensDoDia.length > 0) {
              novaSemana[diaIdx][refeicao.id] = itensDoDia;

              // Adiciona as opções se não existirem na lista de opções
              itensDoDia.forEach((comida) => {
                if (!refeicao.opcoes.includes(comida)) {
                  refeicao.opcoes.push(comida);
                }
              });
            }
          });
        });

        this.rascunho.set(copiar(novaSemana));
        this.salvo.set(copiar(novaSemana));
        this.publicado.set(copiar(novaSemana));
      },
      error: (err) => {
        console.warn('Backend indisponível no momento para cardápio. Usando dados locais.', err);
      },
    });
  }

  private carregarOpcoesDoBackend(): void {
    this.buscarOpcoes().subscribe({
      next: (opcoes) => {
        if (!opcoes || opcoes.length === 0) return;
        opcoes.forEach((op) => {
          const refeicao = this.refeicoes.find((r) => r.id === op.refeicao_id);
          if (refeicao && !refeicao.opcoes.includes(op.nome)) {
            refeicao.opcoes.push(op.nome);
          }
        });
      },
      error: () => {},
    });
  }

  // ===================================================
  // MÉTODOS CONSUMIDOS PELO COMPONENTE CARDAPIO-ADMIN
  // ===================================================

  selecionado(dia: number, refeicao: string, alimento: string): boolean {
    const semana = this.rascunho();
    if (!semana[dia] || !semana[dia][refeicao]) return false;
    return semana[dia][refeicao].includes(alimento);
  }

  alterar(
    dia: number,
    refeicao: string,
    alimento: string,
    marcado: boolean,
  ): void {
    this.rascunho.update((semana) => {
      const nova = copiar(semana);
      const itens = nova[dia][refeicao] || [];

      nova[dia][refeicao] = marcado
        ? [...new Set([...itens, alimento])]
        : itens.filter((item) => item !== alimento);

      return nova;
    });
  }

  temAlteracoes(dia: number, refeicao: string): boolean {
    const atual = [...(this.rascunho()[dia]?.[refeicao] || [])].sort();
    const salvo = [...(this.salvo()[dia]?.[refeicao] || [])].sort();

    return JSON.stringify(atual) !== JSON.stringify(salvo);
  }

  salvar(dia: number, refeicao: string): boolean {
    const itens = this.rascunho()[dia]?.[refeicao] || [];

    if (!itens.length) {
      return false;
    }

    this.salvo.update((semana) => {
      const nova = copiar(semana);
      nova[dia][refeicao] = [...itens];
      return nova;
    });

    // Envia para o backend
    const diaObj = this.dias[dia];
    const refeicaoObj = this.refeicoes.find((r) => r.id === refeicao);

    if (diaObj && refeicaoObj) {
      this.salvarRefeicao(diaObj.dataApi, refeicaoObj.horaIndex, itens).subscribe({
        next: () => {
          console.log(`✅ Refeição ${refeicaoObj.titulo} de ${diaObj.nome} salva no backend.`);
        },
        error: (err) => {
          console.error('❌ Erro ao sincronizar refeição no backend:', err);
        },
      });
    }

    return true;
  }

  publicar(): boolean {
    const pendente = this.dias.some((_, dia) =>
      this.refeicoes.some((refeicao) => this.temAlteracoes(dia, refeicao.id)),
    );

    if (pendente) {
      return false;
    }

    this.publicado.set(copiar(this.salvo()));

    // Salva todos os dias e refeições no backend
    this.dias.forEach((dia, diaIdx) => {
      this.refeicoes.forEach((refeicao) => {
        const itens = this.salvo()[diaIdx][refeicao.id];
        if (itens && itens.length > 0) {
          this.salvarRefeicao(dia.dataApi, refeicao.horaIndex, itens).subscribe();
        }
      });
    });

    return true;
  }

  adicionarAlimento(refeicaoId: string, nome: string): string | null {
    const refeicao = this.refeicoes.find((item) => item.id === refeicaoId);
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
      (item) => normalizar(item) === normalizar(alimento),
    );

    if (existe) {
      return 'Esse alimento já está na lista.';
    }

    refeicao.opcoes = [...refeicao.opcoes, alimento];

    // Registra no backend
    this.adicionarOpcao(refeicaoId, alimento).subscribe();

    return null;
  }

  // ===================================================
  // MÉTODOS HTTP DE INTEGRAÇÃO COM O BACKEND
  // ===================================================

  buscarTodos(): Observable<ItemCardapio[]> {
    return this.http.get<ItemCardapio[]>(this.apiUrl);
  }

  buscarPorDia(dia: string): Observable<ItemCardapio[]> {
    return this.http.get<ItemCardapio[]>(`${this.apiUrl}/${dia}`);
  }

  buscarPorId(id: number): Observable<ItemCardapio> {
    return this.http.get<ItemCardapio>(`${this.apiUrl}/id/${id}`);
  }

  salvarRefeicao(dia: string, hora: number, comidas: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/refeicao`, {
      dia,
      hora,
      comidas,
    });
  }

  buscarOpcoes(): Observable<{ id_opcao: number; refeicao_id: string; nome: string }[]> {
    return this.http.get<{ id_opcao: number; refeicao_id: string; nome: string }[]>(
      `${this.apiUrl}/opcoes`,
    );
  }

  adicionarOpcao(refeicao_id: string, nome: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/opcoes`, {
      refeicao_id,
      nome,
    });
  }

  cadastrar(cardapio: ItemCardapio): Observable<RespostaCardapio> {
    return this.http.post<RespostaCardapio>(this.apiUrl, cardapio);
  }

  atualizar(id: number, cardapio: ItemCardapio): Observable<RespostaCardapio> {
    return this.http.put<RespostaCardapio>(`${this.apiUrl}/${id}`, cardapio);
  }

  excluir(id: number): Observable<RespostaCardapio> {
    return this.http.delete<RespostaCardapio>(`${this.apiUrl}/${id}`);
  }
}