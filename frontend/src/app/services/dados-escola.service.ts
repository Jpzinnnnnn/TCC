import { Injectable } from '@angular/core';

export interface Aviso {
  id: number;
  titulo: string;
  resumo: string;
  detalhes: string;
  categoria: string;
  etiqueta: string;
  cor: string;
  icone: string;
  data: string;
  fim?: string;
  publicado: string;
  horario: string;
}

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

@Injectable({ providedIn: 'root' })
export class DadosEscolaService {
  readonly avisos: Aviso[] = [
    {
      id: 1,
      titulo: 'Reunião de Pais e Mestres',
      resumo:
        'Convidamos todos os pais e responsáveis para a reunião bimestral. Sua participação é muito importante!',
      detalhes:
        'Vamos conversar sobre o desenvolvimento dos estudantes, os resultados do bimestre e as próximas atividades. Procure a secretaria para confirmar a sala da turma.',
      categoria: 'Reuniões',
      etiqueta: 'Reunião',
      cor: 'verde',
      icone: '♧',
      data: '2026-05-24',
      publicado: '2026-05-20',
      horario: '19:00',
    },
    {
      id: 2,
      titulo: 'Feriado Facultativo',
      resumo:
        'Informamos que no dia 30/05 não haverá aula.',
      detalhes:
        'Nesta data não haverá atividades letivas. Em caso de dúvidas sobre o atendimento administrativo, entre em contato com a secretaria.',
      categoria: 'Feriados',
      etiqueta: 'Feriado',
      cor: 'amarelo',
      icone: '☂',
      data: '2026-05-30',
      publicado: '2026-05-19',
      horario: 'Dia inteiro',
    },
    {
      id: 3,
      titulo: 'Prova Bimestral',
      resumo:
        'As provas do 2º bimestre acontecerão entre os dias 02 e 06/06. Fiquem atentos ao cronograma.',
      detalhes:
        'Organize seus estudos e confira com os professores as datas de cada disciplina. Traga os materiais necessários e chegue no horário.',
      categoria: 'Acadêmico',
      etiqueta: 'Acadêmico',
      cor: 'roxo',
      icone: '♢',
      data: '2026-06-02',
      fim: '2026-06-06',
      publicado: '2026-05-18',
      horario: 'Conforme a turma',
    },
    {
      id: 4,
      titulo: 'Olimpíada do Conhecimento',
      resumo:
        'Inscrições abertas para a Olimpíada do Conhecimento! Participe e mostre seu talento.',
      detalhes:
        'Os estudantes interessados devem procurar a coordenação para consultar o regulamento e realizar a inscrição.',
      categoria: 'Eventos',
      etiqueta: 'Evento',
      cor: 'laranja',
      icone: '♙',
      data: '2026-06-15',
      publicado: '2026-05-17',
      horario: 'Consulte a coordenação',
    },
    {
      id: 5,
      titulo: 'Alteração no Horário de Saída',
      resumo:
        'A partir de 02/06, o horário de saída será às 17h20. Agradecemos a compreensão.',
      detalhes:
        'Pedimos que estudantes e responsáveis organizem o transporte considerando o novo horário. Para esclarecimentos, procure a gestão escolar.',
      categoria: 'Geral',
      etiqueta: 'Geral',
      cor: 'azul',
      icone: 'ⓘ',
      data: '2026-06-02',
      publicado: '2026-05-16',
      horario: '17:20',
    },
  ];

  readonly eventos: Evento[] = [
    {
      id: 1,
      titulo: 'Feira de Ciências',
      descricao:
        'Exposição dos projetos científicos desenvolvidos pelos estudantes. A comunidade escolar está convidada a conhecer os trabalhos.',
      categoria: 'Acadêmico',
      cor: 'azul',
      data: '2026-08-28',
      horario: '08h00 às 12h00',
      local: 'Quadra da Escola',
    },
    {
      id: 2,
      titulo: 'Apresentação Cultural',
      descricao:
        'Uma noite de apresentações artísticas preparadas pelos estudantes, com música, dança e teatro.',
      categoria: 'Cultural',
      cor: 'verde',
      data: '2026-09-05',
      horario: '19h00',
      local: 'Auditório',
    },
    {
      id: 3,
      titulo: 'Formatura 3º Técnico',
      descricao:
        'Cerimônia de conclusão da turma do curso técnico. Informações sobre os convites serão divulgadas pela secretaria.',
      categoria: 'Institucional',
      cor: 'rosa',
      data: '2026-09-12',
      horario: '19h00',
      local: 'Salão de Eventos',
    },
    {
      id: 4,
      titulo: 'Reunião de Pais e Mestres',
      descricao:
        'Encontro entre responsáveis e equipe pedagógica para acompanhar o desenvolvimento das turmas.',
      categoria: 'Institucional',
      cor: 'rosa',
      data: '2026-09-18',
      horario: '14h00',
      local: 'Sala de Reuniões',
    },
    {
      id: 5,
      titulo: 'Semana da Consciência Negra',
      descricao:
        'Atividades educativas, apresentações e conversas sobre história, cultura e igualdade racial.',
      categoria: 'Cultural',
      cor: 'verde',
      data: '2026-11-20',
      horario: 'Período integral',
      local: 'Toda a Escola',
    },
  ];
}