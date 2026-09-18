import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LayoutEscolar } from '../compartilhados/layout-escolar/layout-escolar';
import {
  DadosEscolaService,
  Evento,
} from '../services/dados-escola.service';

interface DiaCalendario {
  numero: number;
  chave: string;
  pertenceAoMes: boolean;
  eventos: Evento[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [LayoutEscolar],
  templateUrl: './calendario.html',
  styleUrl: './calendario.scss',
})
export class Calendario implements AfterViewInit {
  private readonly dados = inject(DadosEscolaService);
  private readonly rota = inject(ActivatedRoute);

  @ViewChild('detalhes')
  private modal!: ElementRef<HTMLDialogElement>;

  readonly categorias = [
    'Todos',
    'Acadêmico',
    'Cultural',
    'Institucional',
    'Esportivo',
  ];

  readonly semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Agosto de 2026, conforme o protótipo.
  ano = 2026;
  mes = 7;
  categoria = 'Todos';
  diaSelecionado = '';
  eventoSelecionado: Evento | null = null;

  constructor() {
    const data = this.rota.snapshot.queryParamMap.get('data');

    if (data && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [ano, mes, dia] = data.split('-').map(Number);
      const candidata = new Date(ano, mes - 1, dia);

      if (
        ano >= 1900 &&
        ano <= 2100 &&
        candidata.getFullYear() === ano &&
        candidata.getMonth() === mes - 1 &&
        candidata.getDate() === dia
      ) {
        this.ano = ano;
        this.mes = mes - 1;
      }
    }

    const id = Number(this.rota.snapshot.queryParamMap.get('evento'));
    const evento = this.dados.eventos.find(item => item.id === id);

    if (evento) {
      this.eventoSelecionado = evento;
      this.ano = Number(evento.data.slice(0, 4));
      this.mes = Number(evento.data.slice(5, 7)) - 1;
    }
  }

  ngAfterViewInit(): void {
    if (this.eventoSelecionado) {
      this.modal.nativeElement.showModal();
    }
  }

  get tituloMes(): string {
    const texto = new Date(this.ano, this.mes, 1).toLocaleDateString(
      'pt-BR',
      { month: 'long', year: 'numeric' },
    );

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  get eventosDaCategoria(): Evento[] {
    return this.dados.eventos.filter(evento =>
      this.categoria === 'Todos' || evento.categoria === this.categoria,
    );
  }

  get eventosDoMes(): Evento[] {
    const prefixo = `${this.ano}-${String(this.mes + 1).padStart(2, '0')}`;

    return this.eventosDaCategoria
      .filter(evento => evento.data.startsWith(prefixo))
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  get eventosVisiveis(): Evento[] {
    return this.eventosDoMes.filter(evento =>
      !this.diaSelecionado || evento.data === this.diaSelecionado,
    );
  }

  get dias(): DiaCalendario[] {
    const primeiroDia = new Date(this.ano, this.mes, 1);
    const inicio = new Date(
      this.ano,
      this.mes,
      1 - primeiroDia.getDay(),
    );

    return Array.from({ length: 42 }, (_, indice) => {
      const data = new Date(
        inicio.getFullYear(),
        inicio.getMonth(),
        inicio.getDate() + indice,
      );

      const chave = [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, '0'),
        String(data.getDate()).padStart(2, '0'),
      ].join('-');

      return {
        numero: data.getDate(),
        chave,
        pertenceAoMes: data.getMonth() === this.mes,
        eventos: this.eventosDaCategoria.filter(
          evento => evento.data === chave,
        ),
      };
    });
  }

  mudarMes(direcao: number): void {
    const novaData = new Date(this.ano, this.mes + direcao, 1);

    this.ano = novaData.getFullYear();
    this.mes = novaData.getMonth();
    this.diaSelecionado = '';
  }

  selecionarDia(dia: DiaCalendario): void {
    if (!dia.pertenceAoMes) {
      this.ano = Number(dia.chave.slice(0, 4));
      this.mes = Number(dia.chave.slice(5, 7)) - 1;
    }

    this.diaSelecionado =
      this.diaSelecionado === dia.chave ? '' : dia.chave;
  }

  abrirEvento(evento: Evento, modal: HTMLDialogElement): void {
    this.eventoSelecionado = evento;
    modal.showModal();
  }

  dia(data: string): string {
    return data.slice(8, 10);
  }

  mesCurto(data: string): string {
    const nomes = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
    ];

    return nomes[Number(data.slice(5, 7)) - 1];
  }

  dataCompleta(data: string): string {
    return data.split('-').reverse().join('/');
  }
}