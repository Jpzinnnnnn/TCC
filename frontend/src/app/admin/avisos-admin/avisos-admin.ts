import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import {
  AvisosService,
  AvisoAdministrativo,
} from '../../services/avisos.service';

function formularioInicial() {
  return {
    titulo: '',
    categoria: 'Reuniões',
    descricao: '',
    data: '',
    inicio: '',
    termino: '',
    diaInteiro: false,
    importante: true,
  };
}

@Component({
  selector: 'app-avisos-admin',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './avisos-admin.html',
  styleUrl: './avisos-admin.scss',
})
export class AvisosAdmin {
  readonly avisos = inject(AvisosService);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly categorias = [
    { valor: 'Reuniões', nome: 'Reunião', cor: 'verde', icone: '♧' },
    { valor: 'Feriados', nome: 'Feriado', cor: 'amarelo', icone: '☂' },
    { valor: 'Acadêmico', nome: 'Acadêmico', cor: 'roxo', icone: '♢' },
    { valor: 'Eventos', nome: 'Evento', cor: 'laranja', icone: '♙' },
    { valor: 'Geral', nome: 'Geral', cor: 'azul', icone: 'ⓘ' },
  ];

  formulario = formularioInicial();
  editandoId: number | null = null;
  fimOriginal: string | undefined;

  pesquisa = '';
  pagina = 1;
  readonly porPagina = 5;

  mensagem = '';
  erro = false;

  avisoParaExcluir: AvisoAdministrativo | null = null;

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  get filtrados(): AvisoAdministrativo[] {
    const busca = this.normalizar(this.pesquisa.trim());

    return this.avisos.todos().filter(aviso =>
      this.normalizar(aviso.titulo).includes(busca),
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get visiveis(): AvisoAdministrativo[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.filtrados.slice(inicio, inicio + this.porPagina);
  }

  pesquisar(): void {
    this.pagina = 1;
  }

  publicar(form: NgForm): void {
    this.mensagem = '';
    this.erro = false;

    if (
      form.invalid ||
      !this.formulario.titulo.trim() ||
      !this.formulario.descricao.trim()
    ) {
      form.control.markAllAsTouched();
      this.erro = true;
      this.mensagem = 'Preencha título, descrição, data e os horários obrigatórios.';
      return;
    }

    const dados = this.formulario;

    if (
      !dados.diaInteiro &&
      dados.termino &&
      dados.termino <= dados.inicio
    ) {
      this.erro = true;
      this.mensagem = 'O horário final deve ser posterior ao horário de início.';
      return;
    }

    if (this.fimOriginal && dados.data > this.fimOriginal) {
      this.erro = true;
      this.mensagem =
        'Este aviso possui um período. A data inicial não pode ultrapassar a data final original.';
      return;
    }

    const categoria = this.categorias.find(
      item => item.valor === dados.categoria,
    )!;

    const horario = dados.diaInteiro
      ? 'Dia inteiro'
      : dados.termino
        ? `${dados.inicio} às ${dados.termino}`
        : dados.inicio;

    const estavaEditando = this.editandoId !== null;

    this.avisos.salvar(
      {
        titulo: dados.titulo.trim(),
        resumo: dados.descricao.trim(),
        detalhes: dados.descricao.trim(),
        categoria: categoria.valor,
        etiqueta: categoria.nome,
        cor: categoria.cor,
        icone: categoria.icone,
        data: dados.data,
        fim: this.fimOriginal,
        horario,
        inicio: dados.diaInteiro ? '' : dados.inicio,
        termino: dados.diaInteiro ? '' : dados.termino,
        diaInteiro: dados.diaInteiro,
        importante: dados.importante,
        status: 'Publicado',
      },
      this.editandoId,
    );

    this.cancelar(form);
    this.pesquisa = '';
    this.pagina = 1;

    this.mensagem = estavaEditando
      ? 'Aviso atualizado e publicado nesta sessão.'
      : 'Aviso publicado nesta sessão.';
  }

  editar(
    aviso: AvisoAdministrativo,
    form: NgForm,
    titulo: HTMLInputElement,
  ): void {
    this.editandoId = aviso.id;
    this.fimOriginal = aviso.fim;

    this.formulario = {
      titulo: aviso.titulo,
      categoria: aviso.categoria,
      descricao: aviso.detalhes || aviso.resumo,
      data: aviso.data,
      inicio: aviso.inicio,
      termino: aviso.termino,
      diaInteiro: aviso.diaInteiro,
      importante: aviso.importante,
    };

    form.resetForm(this.formulario);
    this.mensagem = '';
    titulo.focus();
  }

  cancelar(form: NgForm): void {
    this.formulario = formularioInicial();
    this.editandoId = null;
    this.fimOriginal = undefined;
    this.mensagem = '';
    this.erro = false;
    form.resetForm(this.formulario);
  }

  pedirExclusao(
    aviso: AvisoAdministrativo,
    modal: HTMLDialogElement,
  ): void {
    this.avisoParaExcluir = aviso;
    modal.showModal();
  }

  confirmarExclusao(modal: HTMLDialogElement, form: NgForm): void {
    if (!this.avisoParaExcluir) return;

    const id = this.avisoParaExcluir.id;
    this.avisos.excluir(id);

    if (this.editandoId === id) {
      this.cancelar(form);
    }

    this.pagina = Math.min(this.pagina, this.totalPaginas);
    this.avisoParaExcluir = null;
    this.erro = false;
    this.mensagem = 'Aviso excluído nesta sessão.';
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