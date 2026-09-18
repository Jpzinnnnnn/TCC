import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import {
  CalendarioService,
  Evento,
} from '../../services/calendario.service';

function formularioInicial() {
  return {
    titulo: '',
    descricao: '',
    categoria: 'Acadêmico',
    cor: 'azul',
    data: '',
    horario: '',
    local: '',
  };
}

@Component({
  selector: 'app-calendario-admin',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './calendario-admin.html',
  styleUrl: './calendario-admin.scss',
})
export class CalendarioAdmin {
  readonly calendario = inject(CalendarioService);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly categorias = [
    { valor: 'Acadêmico', nome: 'Acadêmico', cor: 'azul' },
    { valor: 'Cultural', nome: 'Cultural', cor: 'verde' },
    { valor: 'Institucional', nome: 'Institucional', cor: 'rosa' },
    { valor: 'Esportivo', nome: 'Esportivo', cor: 'laranja' },
  ];

  readonly cores = [
    { valor: 'azul', nome: 'Azul' },
    { valor: 'verde', nome: 'Verde' },
    { valor: 'rosa', nome: 'Rosa' },
    { valor: 'laranja', nome: 'Laranja' },
    { valor: 'roxo', nome: 'Roxo' },
  ];

  formulario = formularioInicial();
  editandoId: number | null = null;

  pesquisa = '';
  pagina = 1;
  readonly porPagina = 5;

  mensagem = '';
  erro = false;

  eventoParaExcluir: Evento | null = null;

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  get filtrados(): Evento[] {
    const busca = this.normalizar(this.pesquisa.trim());

    return this.calendario.todos().filter(evento =>
      this.normalizar(evento.titulo).includes(busca) ||
      this.normalizar(evento.local).includes(busca) ||
      this.normalizar(evento.categoria).includes(busca)
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get visiveis(): Evento[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.filtrados.slice(inicio, inicio + this.porPagina);
  }

  pesquisar(): void {
    this.pagina = 1;
  }

  salvar(form: NgForm): void {
    this.mensagem = '';
    this.erro = false;

    if (
      form.invalid ||
      !this.formulario.titulo.trim() ||
      !this.formulario.descricao.trim() ||
      !this.formulario.data ||
      !this.formulario.horario.trim() ||
      !this.formulario.local.trim()
    ) {
      form.control.markAllAsTouched();
      this.erro = true;
      this.mensagem = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const dados = {
      titulo: this.formulario.titulo.trim(),
      descricao: this.formulario.descricao.trim(),
      categoria: this.formulario.categoria,
      cor: this.formulario.cor,
      data: this.formulario.data,
      horario: this.formulario.horario.trim(),
      local: this.formulario.local.trim(),
    };

    const estavaEditando = this.editandoId !== null;

    this.calendario.salvar(dados, this.editandoId).subscribe({
      next: () => {
        this.mensagem = estavaEditando
          ? 'Evento atualizado com sucesso no banco de dados!'
          : 'Evento cadastrado com sucesso no banco de dados!';
      },
      error: () => {
        this.erro = true;
        this.mensagem = 'Erro ao sincronizar evento com o banco de dados.';
      },
    });

    this.cancelar(form);
    this.pesquisa = '';
    this.pagina = 1;
  }

  editar(
    evento: Evento,
    form: NgForm,
    tituloInput: HTMLInputElement,
  ): void {
    this.editandoId = evento.id;

    this.formulario = {
      titulo: evento.titulo,
      descricao: evento.descricao,
      categoria: evento.categoria,
      cor: evento.cor,
      data: evento.data,
      horario: evento.horario,
      local: evento.local,
    };

    form.resetForm(this.formulario);
    this.mensagem = '';
    tituloInput.focus();
  }

  cancelar(form: NgForm): void {
    this.formulario = formularioInicial();
    this.editandoId = null;
    this.mensagem = '';
    this.erro = false;
    form.resetForm(this.formulario);
  }

  pedirExclusao(evento: Evento, modal: HTMLDialogElement): void {
    this.eventoParaExcluir = evento;
    modal.showModal();
  }

  confirmarExclusao(modal: HTMLDialogElement, form: NgForm): void {
    if (!this.eventoParaExcluir) return;

    const id = this.eventoParaExcluir.id;
    this.calendario.excluir(id).subscribe({
      next: () => {
        this.mensagem = 'Evento excluído com sucesso do banco de dados.';
      },
      error: () => {
        this.erro = true;
        this.mensagem = 'Erro ao excluir evento do banco de dados.';
      },
    });

    if (this.editandoId === id) {
      this.cancelar(form);
    }

    this.pagina = Math.min(this.pagina, this.totalPaginas);
    this.eventoParaExcluir = null;
    this.erro = false;
    modal.close();
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  sair(): void {
    this.auth.sair();
    void this.router.navigateByUrl('/admin', { replaceUrl: true });
  }
}
