const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'monsenhor_bicudo',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Senhas a tentar na ordem de prioridade
const SENHAS_PARA_TENTAR = process.env.DB_PASSWORD !== undefined
  ? [process.env.DB_PASSWORD]
  : ['root', '123456', ''];

let pool = null;
let senhaAtiva = SENHAS_PARA_TENTAR[0];

async function encontrarConexaoValida() {
  const erros = [];
  for (const senha of SENHAS_PARA_TENTAR) {
    try {
      const conexao = await mysql.createConnection({
        host: DB_CONFIG.host,
        user: DB_CONFIG.user,
        password: senha,
        port: DB_CONFIG.port
      });
      await conexao.ping();
      await conexao.end();
      senhaAtiva = senha;
      console.log(`🔑 Conexão com MySQL estabelecida utilizando autenticação apropriada.`);
      return senha;
    } catch (err) {
      erros.push({ senha, erro: err.message, code: err.code });
      if (err.code === 'ECONNREFUSED') {
        // Se a porta está fechada / MySQL não está rodando, não adianta testar outras senhas
        break;
      }
    }
  }

  const primeiroErro = erros[0];
  if (primeiroErro && primeiroErro.code === 'ECONNREFUSED') {
    throw new Error(
      `Não foi possível conectar ao MySQL em ${DB_CONFIG.host}:${DB_CONFIG.port} (Conexão recusada / ECONNREFUSED).\n` +
      `💡 Verifique se o serviço do MySQL ou o container Docker está ativo no seu computador.`
    );
  }

  throw new Error(
    `Não foi possível autenticar no MySQL (${DB_CONFIG.user}@${DB_CONFIG.host}:${DB_CONFIG.port}).\n` +
    `💡 Defina a variável de ambiente DB_PASSWORD com a senha do MySQL (ex: DB_PASSWORD=suasenha npm start).`
  );
}

async function initDb() {
  try {
    const senha = await encontrarConexaoValida();

    // 1. Cria o banco se não existir
    const connInicial = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: senha,
      port: DB_CONFIG.port
    });

    await connInicial.query(`
      CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    await connInicial.end();

    // 2. Inicializa o pool conectado ao banco
    pool = mysql.createPool({
      ...DB_CONFIG,
      password: senha
    });

    // 3. Cria as tabelas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Horario (
        id_horario INT AUTO_INCREMENT PRIMARY KEY,
        hora INT NOT NULL,
        dia VARCHAR(20) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Cardapio (
        id_cardapio INT AUTO_INCREMENT PRIMARY KEY,
        comida VARCHAR(255) NOT NULL,
        fk_id_horario INT NOT NULL,
        FOREIGN KEY (fk_id_horario) REFERENCES Horario(id_horario) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS OpcaoAlimento (
        id_opcao INT AUTO_INCREMENT PRIMARY KEY,
        refeicao_id VARCHAR(50) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        UNIQUE KEY uq_ref_nome (refeicao_id, nome)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Aviso (
        id_aviso INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descricao TEXT NOT NULL,
        data VARCHAR(20) NOT NULL,
        horario_comeco VARCHAR(20) DEFAULT NULL,
        horario_final VARCHAR(20) DEFAULT NULL,
        evento_dia BOOLEAN DEFAULT FALSE,
        importante BOOLEAN DEFAULT FALSE,
        publicado VARCHAR(20) DEFAULT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Evento (
        id_evento INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        cor VARCHAR(50) DEFAULT 'azul',
        data VARCHAR(20) NOT NULL,
        horario VARCHAR(100) NOT NULL,
        local VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Seed de dados iniciais se tabelas vazias
    await semearDadosIniciais();

    console.log('✅ Banco de dados e tabelas prontos para uso.');
    return pool;
  } catch (err) {
    console.error('❌ Erro na inicialização do banco de dados:', err);
    throw err;
  }
}

async function semearDadosIniciais() {
  // Usuário Admin
  const [usuarios] = await pool.query('SELECT COUNT(*) as total FROM Usuario');
  if (usuarios[0].total === 0) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      'INSERT INTO Usuario (email, senha) VALUES (?, ?)',
      ['admin@escola.com', hash]
    );
    console.log('🌱 Usuário padrão cadastrado: admin@escola.com / Admin123!');
  }

  // Avisos iniciais
  const [avisos] = await pool.query('SELECT COUNT(*) as total FROM Aviso');
  if (avisos[0].total === 0) {
    const avisosIniciais = [
      {
        titulo: 'Reunião de Pais e Mestres',
        categoria: 'Reuniões',
        descricao: 'Convidamos todos os pais e responsáveis para a reunião bimestral. Sua participação é muito importante!',
        data: '2026-05-24',
        horario_comeco: '19:00',
        horario_final: '21:00',
        evento_dia: false,
        importante: true,
        publicado: '2026-05-20'
      },
      {
        titulo: 'Feriado Facultativo',
        categoria: 'Feriados',
        descricao: 'Informamos que no dia 30/05 não haverá aula. Em caso de dúvidas, consulte a secretaria.',
        data: '2026-05-30',
        horario_comeco: null,
        horario_final: null,
        evento_dia: true,
        importante: false,
        publicado: '2026-05-19'
      },
      {
        titulo: 'Prova Bimestral',
        categoria: 'Acadêmico',
        descricao: 'As provas do 2º bimestre acontecerão entre os dias 02 e 06/06. Fiquem atentos ao cronograma.',
        data: '2026-06-02',
        horario_comeco: '07:30',
        horario_final: '12:30',
        evento_dia: false,
        importante: false,
        publicado: '2026-05-18'
      },
      {
        titulo: 'Olimpíada do Conhecimento',
        categoria: 'Eventos',
        descricao: 'Inscrições abertas para a Olimpíada do Conhecimento! Procure a coordenação para mais detalhes.',
        data: '2026-06-15',
        horario_comeco: '14:00',
        horario_final: '17:00',
        evento_dia: false,
        importante: false,
        publicado: '2026-05-17'
      }
    ];

    for (const a of avisosIniciais) {
      await pool.query(
        `INSERT INTO Aviso (titulo, categoria, descricao, data, horario_comeco, horario_final, evento_dia, importante, publicado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.titulo, a.categoria, a.descricao, a.data, a.horario_comeco, a.horario_final, a.evento_dia, a.importante, a.publicado]
      );
    }
    console.log('🌱 Avisos iniciais semeados.');
  }

  // Eventos do Calendário
  const [eventos] = await pool.query('SELECT COUNT(*) as total FROM Evento');
  if (eventos[0].total === 0) {
    const eventosIniciais = [
      {
        titulo: 'Feira de Ciências',
        descricao: 'Exposição dos projetos científicos desenvolvidos pelos estudantes da escola.',
        categoria: 'Acadêmico',
        cor: 'azul',
        data: '2026-08-28',
        horario: '08h00 às 12h00',
        local: 'Quadra da Escola'
      },
      {
        titulo: 'Apresentação Cultural',
        descricao: 'Apresentações artísticas de música, dança e teatro organizadas pelos estudantes.',
        categoria: 'Cultural',
        cor: 'verde',
        data: '2026-09-05',
        horario: '19h00',
        local: 'Auditório'
      },
      {
        titulo: 'Formatura 3º Técnico',
        descricao: 'Cerimônia de conclusão dos estudantes do curso técnico.',
        categoria: 'Institucional',
        cor: 'rosa',
        data: '2026-09-12',
        horario: '19h00',
        local: 'Salão de Eventos'
      },
      {
        titulo: 'Reunião de Pais e Mestres',
        descricao: 'Encontro de acompanhamento pedagógico entre responsáveis e equipe escolar.',
        categoria: 'Institucional',
        cor: 'rosa',
        data: '2026-09-18',
        horario: '14h00',
        local: 'Sala de Reuniões'
      },
      {
        titulo: 'Semana da Consciência Negra',
        descricao: 'Atividades educativas, rodas de conversa e apresentações sobre igualdade racial.',
        categoria: 'Cultural',
        cor: 'verde',
        data: '2026-11-20',
        horario: 'Período integral',
        local: 'Toda a Escola'
      }
    ];

    for (const e of eventosIniciais) {
      await pool.query(
        `INSERT INTO Evento (titulo, descricao, categoria, cor, data, horario, local)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [e.titulo, e.descricao, e.categoria, e.cor, e.data, e.horario, e.local]
      );
    }
    console.log('🌱 Eventos do calendário semeados.');
  }

  // Opções padrão de alimentos
  const [opcoes] = await pool.query('SELECT COUNT(*) as total FROM OpcaoAlimento');
  if (opcoes[0].total === 0) {
    const padroes = [
      { refeicao: 'manha', itens: ['Leite com achocolatado', 'Pão com manteiga', 'Fruta da estação', 'Biscoito cream cracker', 'Iogurte natural', 'Suco de fruta'] },
      { refeicao: 'almoco', itens: ['Arroz branco', 'Feijão carioca', 'Frango assado', 'Salada verde', 'Carne moída', 'Legumes refogados', 'Farofa'] },
      { refeicao: 'tarde', itens: ['Suco de frutas', 'Bolo caseiro', 'Biscoito maizena', 'Fruta', 'Pão com queijo', 'Vitamina de banana'] }
    ];

    for (const ref of padroes) {
      for (const item of ref.itens) {
        await pool.query(
          'INSERT IGNORE INTO OpcaoAlimento (refeicao_id, nome) VALUES (?, ?)',
          [ref.refeicao, item]
        );
      }
    }
    console.log('🌱 Opções de alimentos para o cardápio semeadas.');
  }

  // Cardápio da semana atual
  const [cardapios] = await pool.query('SELECT COUNT(*) as total FROM Cardapio');
  if (cardapios[0].total === 0) {
    // Adiciona alguns horários e alimentos de exemplo
    const hoje = new Date();
    const diaInicio = new Date(hoje);
    diaInicio.setDate(hoje.getDate() - hoje.getDay() + 1); // Segunda-feira

    const cardapioExemplo = [
      { hora: 0, comidas: ['Leite com achocolatado', 'Pão com manteiga', 'Fruta da estação'] },
      { hora: 1, comidas: ['Arroz branco', 'Feijão carioca', 'Frango assado', 'Salada verde'] },
      { hora: 2, comidas: ['Suco de frutas', 'Bolo caseiro', 'Fruta'] }
    ];

    for (let d = 0; d < 5; d++) {
      const ano = dataDia.getFullYear();
      const mes = String(dataDia.getMonth() + 1).padStart(2, '0');
      const dia = String(dataDia.getDate()).padStart(2, '0');
      const dataStr = `${ano}-${mes}-${dia}`;

      for (const item of cardapioExemplo) {
        const [resH] = await pool.query(
          'INSERT INTO Horario (hora, dia) VALUES (?, ?)',
          [item.hora, dataStr]
        );
        const idHorario = resH.insertId;

        for (const c of item.comidas) {
          await pool.query(
            'INSERT INTO Cardapio (comida, fk_id_horario) VALUES (?, ?)',
            [c, idHorario]
          );
        }
      }
    }
    console.log('🌱 Cardápio da semana semeado.');
  }
}

// Proxy dinâmico para garantir que o pool esteja inicializado nas chamadas
const dbProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'initDb') return initDb;
    if (prop === 'getPool') return () => pool;
    if (!pool) {
      // Se chamado antes de initDb, inicializa sincronamente se possível ou retorna função assíncrona
      return async (...args) => {
        if (!pool) {
          await initDb();
        }
        return pool[prop](...args);
      };
    }
    return pool[prop].bind(pool);
  }
});

module.exports = dbProxy;