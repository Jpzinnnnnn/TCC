import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Aviso, DadosEscolaService } from './dados-escola.service';

export interface AvisoAdministrativo extends Aviso {
  status: 'Publicado' | 'Rascunho';
  diaInteiro: boolean;
  importante: boolean;
  inicio: string;
  termino: string;
}

export type NovoAviso = Omit<AvisoAdministrativo, 'id' | 'publicado'>;

export interface AvisoBackend {
  id_aviso: number;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  horario_comeco?: string | null;
  horario_final?: string | null;
  evento_dia?: boolean | number;
  importante?: boolean | number;
  publicado?: string | null;
}

const CATEGORIAS_MAP: Record<string, { etiqueta: string; cor: string; icone: string }> = {
  Reuniões: { etiqueta: 'Reunião', cor: 'verde', icone: '♧' },
  Feriados: { etiqueta: 'Feriado', cor: 'amarelo', icone: '☂' },
  Acadêmico: { etiqueta: 'Acadêmico', cor: 'roxo', icone: '♢' },
  Eventos: { etiqueta: 'Evento', cor: 'laranja', icone: '♙' },
  Geral: { etiqueta: 'Geral', cor: 'azul', icone: 'ⓘ' },
};

function mapearDoBackend(item: AvisoBackend): AvisoAdministrativo {
  const meta = CATEGORIAS_MAP[item.categoria] || {
    etiqueta: item.categoria,
    cor: 'azul',
    icone: 'ⓘ',
  };

  const diaInteiro = Boolean(item.evento_dia);
  const inicio = item.horario_comeco || '';
  const termino = item.horario_final || '';

  const horario = diaInteiro
    ? 'Dia inteiro'
    : inicio && termino
      ? `${inicio} às ${termino}`
      : inicio || 'Horário a definir';

  return {
    id: item.id_aviso,
    titulo: item.titulo,
    resumo: item.descricao,
    detalhes: item.descricao,
    categoria: item.categoria,
    etiqueta: meta.etiqueta,
    cor: meta.cor,
    icone: meta.icone,
    data: item.data,
    publicado: item.publicado || item.data,
    horario,
    inicio,
    termino,
    diaInteiro,
    importante: Boolean(item.importante),
    status: 'Publicado',
  };
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/avisos';
  private readonly exemplos = inject(DadosEscolaService);

  private readonly registros = signal<AvisoAdministrativo[]>(
    this.exemplos.avisos.map(aviso => ({
      ...aviso,
      status: aviso.id === 4 ? 'Rascunho' : 'Publicado',
      diaInteiro: aviso.horario === 'Dia inteiro',
      importante: aviso.id === 1,
      inicio: /^\d{2}:\d{2}$/.test(aviso.horario) ? aviso.horario : '',
      termino: '',
    })),
  );

  readonly todos = this.registros.asReadonly();

  readonly publicados = computed(() =>
    this.registros().filter(aviso => aviso.status === 'Publicado'),
  );

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.http.get<AvisoBackend[]>(this.apiUrl).subscribe({
      next: dados => {
        if (dados && dados.length > 0) {
          const formatados = dados.map(mapearDoBackend);
          this.registros.set(formatados);
        }
      },
      error: err => {
        console.warn('Backend indisponível no momento para avisos. Usando dados locais.', err);
      },
    });
  }

  buscarTodos(): Observable<AvisoAdministrativo[]> {
    return new Observable(observer => {
      this.http.get<AvisoBackend[]>(this.apiUrl).subscribe({
        next: dados => {
          const formatados = dados.map(mapearDoBackend);
          this.registros.set(formatados);
          observer.next(formatados);
          observer.complete();
        },
        error: err => {
          observer.next(this.registros());
          observer.complete();
        },
      });
    });
  }

  buscarPorId(id: number): Observable<AvisoAdministrativo | undefined> {
    return new Observable(observer => {
      this.http.get<AvisoBackend>(`${this.apiUrl}/${id}`).subscribe({
        next: dado => {
          observer.next(mapearDoBackend(dado));
          observer.complete();
        },
        error: () => {
          observer.next(this.registros().find(a => a.id === id));
          observer.complete();
        },
      });
    });
  }

  salvar(dados: NovoAviso, id: number | null): Observable<any> {
    const payload = {
      titulo: dados.titulo,
      categoria: dados.categoria,
      descricao: dados.detalhes || dados.resumo,
      data: dados.data,
      horario_comeco: dados.diaInteiro ? null : dados.inicio || null,
      horario_final: dados.diaInteiro ? null : dados.termino || null,
      evento_dia: dados.diaInteiro,
      importante: dados.importante,
    };

    if (id !== null) {
      // Atualização (PUT)
      return this.http.put(`${this.apiUrl}/${id}`, payload).pipe(
        tap(() => {
          this.registros.update(lista =>
            lista.map(aviso =>
              aviso.id === id ? { ...aviso, ...dados } : aviso,
            ),
          );
        }),
        catchError(err => {
          // Fallback local se backend falhar
          this.registros.update(lista =>
            lista.map(aviso =>
              aviso.id === id ? { ...aviso, ...dados } : aviso,
            ),
          );
          return of({ sucesso: true, local: true });
        }),
      );
    }

    // Criação (POST)
    return this.http.post<{ id_aviso: number; mensagem: string }>(this.apiUrl, payload).pipe(
      tap(res => {
        const agora = new Date();
        const publicado = [
          agora.getFullYear(),
          String(agora.getMonth() + 1).padStart(2, '0'),
          String(agora.getDate()).padStart(2, '0'),
        ].join('-');

        const novo: AvisoAdministrativo = {
          ...dados,
          id: res?.id_aviso || Math.max(0, ...this.registros().map(a => a.id)) + 1,
          publicado,
        };

        this.registros.update(lista => [novo, ...lista]);
      }),
      catchError(err => {
        const agora = new Date();
        const publicado = [
          agora.getFullYear(),
          String(agora.getMonth() + 1).padStart(2, '0'),
          String(agora.getDate()).padStart(2, '0'),
        ].join('-');

        const novo: AvisoAdministrativo = {
          ...dados,
          id: Math.max(0, ...this.registros().map(a => a.id)) + 1,
          publicado,
        };

        this.registros.update(lista => [novo, ...lista]);
        return of({ sucesso: true, local: true });
      }),
    );
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.registros.update(lista => lista.filter(aviso => aviso.id !== id));
      }),
      catchError(err => {
        this.registros.update(lista => lista.filter(aviso => aviso.id !== id));
        return of({ sucesso: true, local: true });
      }),
    );
  }
}