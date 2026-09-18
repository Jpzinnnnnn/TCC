import { Injectable, computed, inject, signal } from '@angular/core';
import { Aviso, DadosEscolaService } from './dados-escola.service';

export interface AvisoAdministrativo extends Aviso {
  status: 'Publicado' | 'Rascunho';
  diaInteiro: boolean;
  importante: boolean;
  inicio: string;
  termino: string;
}

export type NovoAviso = Omit<AvisoAdministrativo, 'id' | 'publicado'>;

@Injectable({ providedIn: 'root' })
export class AvisosService {
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

  salvar(dados: NovoAviso, id: number | null): void {
    if (id !== null) {
      this.registros.update(lista =>
        lista.map(aviso =>
          aviso.id === id ? { ...aviso, ...dados } : aviso,
        ),
      );
      return;
    }

    const agora = new Date();
    const publicado = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, '0'),
      String(agora.getDate()).padStart(2, '0'),
    ].join('-');

    const novo: AvisoAdministrativo = {
      ...dados,
      id: Math.max(0, ...this.registros().map(aviso => aviso.id)) + 1,
      publicado,
    };

    this.registros.update(lista => [novo, ...lista]);
  }

  excluir(id: number): void {
    this.registros.update(lista => lista.filter(aviso => aviso.id !== id));
  }
}