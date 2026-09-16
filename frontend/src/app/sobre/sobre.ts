import { Component, inject } from '@angular/core';
import { LayoutEscolar } from '../compartilhados/layout-escolar/layout-escolar';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [LayoutEscolar],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss',
})
export class Sobre {
  // Conteúdo de demonstração baseado no protótipo.
  // Depois poderá ser carregado pelo serviço conectado à API.

  readonly administrativo =
  inject(ActivatedRoute).snapshot.data['administrativo'] === true;

  readonly valores = [
    'Respeito e responsabilidade',
    'Educação inclusiva e de qualidade',
    'Compromisso com a comunidade',
    'Honestidade e transparência',
    'Criatividade e autonomia',
  ];

  readonly segundaSerie = [
    {
      titulo: 'Lógica e Linguagem de Programação',
      descricao:
        'Fundamentos de lógica, algoritmos e desenvolvimento de soluções.',
    },
    {
      titulo: 'Redes de Computadores e Segurança da Informação',
      descricao:
        'Conceitos de redes, comunicação entre dispositivos e segurança de dados.',
    },
    {
      titulo: 'Versionamento e Desenvolvimento de Software e Metodologias Ágeis',
      descricao:
        'Controle de versões, colaboração e organização de projetos de software.',
    },
    {
      titulo: 'Carreira e Competências',
      descricao:
        'Desenvolvimento de competências profissionais e preparação para o trabalho.',
    },
  ];

  readonly terceiraSerie = [
    {
      titulo: 'Programação Front-End',
      descricao:
        'Construção de interfaces e aplicações web com HTML, CSS e JavaScript.',
    },
    {
      titulo: 'Programação Back-End',
      descricao:
        'Desenvolvimento de sistemas, regras de negócio e integração com serviços.',
    },
    {
      titulo: 'Programação Mobile',
      descricao:
        'Criação de interfaces e aplicações para dispositivos móveis.',
    },
    {
      titulo: 'Inteligência Artificial',
      descricao:
        'Introdução aos conceitos e às aplicações da inteligência artificial.',
    },
    {
      titulo: 'Projeto Multidisciplinar',
      descricao:
        'Desenvolvimento de soluções em equipe, da proposta à apresentação final.',
    },
    {
      titulo: 'Versionamento de Código e Sistemas de Mensageria',
      descricao:
        'Organização do código, colaboração e comunicação entre sistemas.',
    },
    {
      titulo: 'Modelagem e Desenvolvimento de Banco de Dados',
      descricao:
        'Estruturação de dados, consultas e integração com aplicações.',
    },
  ];

  readonly diferenciais = [
    {
      icone: '💡',
      titulo: 'Projetos Reais',
      descricao:
        'Desenvolvimento de projetos práticos, conectando o aprendizado à realidade.',
    },
    {
      icone: '🤝',
      titulo: 'Parcerias em TI',
      descricao:
        'Conexão entre o ensino de tecnologia e as necessidades do mercado.',
    },
    {
      icone: '💻',
      titulo: 'Labs Modernos',
      descricao:
        'Laboratórios de informática para aprender e colocar ideias em prática.',
    },
    {
      icone: '👨‍🏫',
      titulo: 'Professores Especializados',
      descricao:
        'Uma equipe dedicada ao desenvolvimento técnico e pessoal dos estudantes.',
    },
  ];

  readonly tecnologias = ['Angular', 'TypeScript', 'HTML5', 'SCSS', 'MySQL'];
}