import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { RouterLink } from '@angular/router';

import {
  CardapioService,
  ItemCardapio
} from '../services/cardapio.service';


@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cardapio.html',
  styleUrl: './cardapio.scss',
})
export class Cardapio implements OnInit {

  // =====================================================
  // SERVICE
  // =====================================================

  private readonly servico = inject(
    CardapioService
  );


  // =====================================================
  // DIA SELECIONADO
  // =====================================================

  diaSelecionado = 0;


  // =====================================================
  // CARDÁPIO VINDO DO BANCO
  // =====================================================

  cardapio: ItemCardapio[] = [];


  // =====================================================
  // ESTADOS DA TELA
  // =====================================================

  carregando = true;

  erro = '';


  // =====================================================
  // DIAS DA SEMANA
  // =====================================================

  dias: {
    nome: string;
    data: string;
    titulo: string;
    dataApi: string;
  }[] = [];


  // =====================================================
  // REFEIÇÕES
  // =====================================================

  refeicoes = [

    {
      id: 0,
      titulo: 'Café da manhã',
      horario: 'Café da manhã',
      mensagem:
        'Uma boa alimentação ajuda você a começar bem o dia.'
    },

    {
      id: 1,
      titulo: 'Almoço',
      horario: 'Almoço',
      mensagem:
        'Uma refeição equilibrada ajuda no aprendizado e no desenvolvimento.'
    },

    {
      id: 2,
      titulo: 'Café da tarde',
      horario: 'Café da tarde',
      mensagem:
        'Um lanche saudável para continuar o dia com energia.'
    }

  ];


  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  ngOnInit(): void {

    this.montarDias();

    this.buscarCardapio();

  }


  // =====================================================
  // MONTAR OS 7 DIAS
  // =====================================================

  private montarDias(): void {

    const hoje = new Date();

    const inicioSemana = new Date(hoje);

    inicioSemana.setDate(
      hoje.getDate() - hoje.getDay()
    );


    const nomesDias = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado'
    ];


    this.dias = Array.from(
      { length: 7 },
      (_, indice) => {

        const data = new Date(
          inicioSemana
        );

        data.setDate(
          inicioSemana.getDate() + indice
        );


        const ano =
          data.getFullYear();


        const mes =
          String(
            data.getMonth() + 1
          ).padStart(2, '0');


        const dia =
          String(
            data.getDate()
          ).padStart(2, '0');


        const dataApi =
          `${ano}-${mes}-${dia}`;


        return {

          nome:
            nomesDias[indice],

          data:
            `${dia}/${mes}`,

          titulo:
            `${nomesDias[indice]}, ${dia} de ${
              this.nomeMes(
                data.getMonth()
              )
            }`,

          dataApi

        };

      }
    );

  }


  // =====================================================
  // NOME DO MÊS
  // =====================================================

  private nomeMes(
    mes: number
  ): string {

    const meses = [

      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro'

    ];

    return meses[mes];

  }


  // =====================================================
  // BUSCAR CARDÁPIO
  // =====================================================

  buscarCardapio(): void {

    this.carregando = true;

    this.erro = '';


    this.servico.buscarTodos().subscribe({

      next: (
        dados: ItemCardapio[]
      ) => {

        this.cardapio = dados;

        this.carregando = false;

      },


      error: (erro) => {

        console.error(
          '❌ Erro ao carregar cardápio:',
          erro
        );

        this.erro =
          'Não foi possível carregar o cardápio.';

        this.carregando = false;

      }

    });

  }


  // =====================================================
  // DIA ATUAL
  // =====================================================

  get diaAtual() {

    return this.dias[
      this.diaSelecionado
    ];

  }


  // =====================================================
  // REFEIÇÕES DO DIA
  // =====================================================

  get refeicoesDoDia() {

    if (!this.diaAtual) {

      return [];

    }


    return this.refeicoes.map(
      refeicao => {

        const alimentos =
          this.cardapio

            .filter(item => {

              return (

                item.dia ===
                this.diaAtual.dataApi

                &&

                item.hora ===
                refeicao.id

              );

            })

            .map(
              item => item.comida
            );


        return {

          ...refeicao,

          alimentos

        };

      }
    );

  }


  // =====================================================
  // SELECIONAR DIA
  // =====================================================

  selecionarDia(
    indice: number
  ): void {

    if (

      indice >= 0 &&

      indice < this.dias.length

    ) {

      this.diaSelecionado =
        indice;

    }

  }


  // =====================================================
  // MUDAR DIA
  // =====================================================

  mudarDia(
    direcao: number
  ): void {

    this.selecionarDia(

      this.diaSelecionado +
      direcao

    );

  }


  // =====================================================
  // VERIFICAR ALIMENTOS
  // =====================================================

  temAlimentos(
    alimentos: string[]
  ): boolean {

    return alimentos.length > 0;

  }

}