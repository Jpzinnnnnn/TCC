import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LayoutEscolar } from '../compartilhados/layout-escolar/layout-escolar';
import {
  Aviso,
  DadosEscolaService,
} from '../dados-escola.service';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [FormsModule, RouterLink, LayoutEscolar],
  templateUrl: './avisos.html',
  styleUrl: './avisos.scss',
})
export class Avisos {
  private readonly dados = inject(DadosEscolaService);

  readonly categorias = [
    'Todos',
    'Reuniões',
    'Eventos',
    'Feriados',
    'Acadêmico',
    'Geral',
  ];

  readonly meses = [...new Set(
    this.dados.avisos.map(aviso => aviso.data.slice(0, 7)),
  )].sort();

  readonly proximosEventos = [...this.dados.eventos]
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);

  categoria = 'Todos';
  pesquisa = '';
  mes = '';
  ordem = 'recentes';
  avisoSelecionado: Aviso | null = null;

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  get avisosFiltrados(): Aviso[] {
    const busca = this.normalizar(this.pesquisa.trim());

    const resultado = this.dados.avisos.filter(aviso => {
      const correspondeCategoria =
        this.categoria === 'Todos' ||
        aviso.categoria === this.categoria;

      const correspondePesquisa = this.normalizar(
        `${aviso.titulo} ${aviso.resumo} ${aviso.detalhes}`,
      ).includes(busca);

      const correspondeMes =
        !this.mes || aviso.data.startsWith(this.mes);

      return correspondeCategoria && correspondePesquisa && correspondeMes;
    });

    return resultado.sort((a, b) => {
      if (this.ordem === 'antigos') {
        return a.publicado.localeCompare(b.publicado);
      }

      if (this.ordem === 'data') {
        return a.data.localeCompare(b.data);
      }

      return b.publicado.localeCompare(a.publicado);
    });
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

  nomeMes(valor: string): string {
    const [ano, mes] = valor.split('-').map(Number);

    return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  dataCompleta(data: string): string {
    return data.split('-').reverse().join('/');
  }

  abrirAviso(aviso: Aviso, modal: HTMLDialogElement): void {
    this.avisoSelecionado = aviso;
    modal.showModal();
  }

  limparFiltros(): void {
    this.categoria = 'Todos';
    this.pesquisa = '';
    this.mes = '';
    this.ordem = 'recentes';
  }
}