import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { DadosEscolaService } from './dados-escola.service';

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  cor: string;
  data: string;
  horario: string;
  local: string;
}

export type NovoEvento = Omit<Evento, 'id'>;

interface EventoBackend {
  id_evento: number;
  titulo: string;
  descricao: string;
  categoria: string;
  cor: string;
  data: string;
  horario: string;
  local: string;
}

function mapearDoBackend(item: EventoBackend): Evento {
  return {
    id: item.id_evento,
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    cor: item.cor || 'azul',
    data: item.data,
    horario: item.horario,
    local: item.local,
  };
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/eventos';
  private readonly dadosEscola = inject(DadosEscolaService);

  private readonly listaEventos = signal<Evento[]>(
    this.dadosEscola.eventos.map((e) => ({ ...e })),
  );

  readonly todos = this.listaEventos.asReadonly();

  constructor() {
    this.carregar();
  }

  carregar(): void {
    this.http.get<EventoBackend[]>(this.apiUrl).subscribe({
      next: (dados) => {
        if (dados && dados.length > 0) {
          this.listaEventos.set(dados.map(mapearDoBackend));
        }
      },
      error: (err) => {
        console.warn(
          'Backend indisponível no momento para eventos. Usando dados locais.',
          err,
        );
      },
    });
  }

  buscarTodos(): Observable<Evento[]> {
    return new Observable((observer) => {
      this.http.get<EventoBackend[]>(this.apiUrl).subscribe({
        next: (dados) => {
          const mapeados = dados.map(mapearDoBackend);
          this.listaEventos.set(mapeados);
          observer.next(mapeados);
          observer.complete();
        },
        error: () => {
          observer.next(this.listaEventos());
          observer.complete();
        },
      });
    });
  }

  buscarPorId(id: number): Observable<Evento | undefined> {
    return new Observable((observer) => {
      this.http.get<EventoBackend>(`${this.apiUrl}/${id}`).subscribe({
        next: (dado) => {
          observer.next(mapearDoBackend(dado));
          observer.complete();
        },
        error: () => {
          observer.next(this.listaEventos().find((e) => e.id === id));
          observer.complete();
        },
      });
    });
  }

  salvar(dados: NovoEvento, id: number | null): Observable<any> {
    if (id !== null) {
      return this.http.put(`${this.apiUrl}/${id}`, dados).pipe(
        tap(() => {
          this.listaEventos.update((lista) =>
            lista.map((e) => (e.id === id ? { ...e, ...dados } : e)),
          );
        }),
        catchError(() => {
          this.listaEventos.update((lista) =>
            lista.map((e) => (e.id === id ? { ...e, ...dados } : e)),
          );
          return of({ sucesso: true, local: true });
        }),
      );
    }

    return this.http.post<{ id_evento: number; mensagem: string }>(this.apiUrl, dados).pipe(
      tap((res) => {
        const novo: Evento = {
          ...dados,
          id: res?.id_evento || Math.max(0, ...this.listaEventos().map((e) => e.id)) + 1,
        };
        this.listaEventos.update((lista) => [...lista, novo]);
      }),
      catchError(() => {
        const novo: Evento = {
          ...dados,
          id: Math.max(0, ...this.listaEventos().map((e) => e.id)) + 1,
        };
        this.listaEventos.update((lista) => [...lista, novo]);
        return of({ sucesso: true, local: true });
      }),
    );
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.listaEventos.update((lista) => lista.filter((e) => e.id !== id));
      }),
      catchError(() => {
        this.listaEventos.update((lista) => lista.filter((e) => e.id !== id));
        return of({ sucesso: true, local: true });
      }),
    );
  }
}
