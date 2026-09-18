const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// ROTA DE TESTE
// =====================================================

app.get('/', (req, res) => {
  res.json({
    sucesso: true,
    message: 'Backend Monsenhor Bicudo funcionando!'
  });
});


// =====================================================
// AUTENTICAÇÃO - LOGIN
// =====================================================

app.post('/login', async (req, res) => {
  console.log('📥 Tentativa de login:', req.body?.email);

  const { email, senha } = req.body || {};

  if (!email || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha o e-mail e a senha.'
    });
  }

  try {
    const [results] = await db.query(
      `SELECT id_usuario, email, senha FROM Usuario WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (results.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'E-mail ou senha incorretos.'
      });
    }

    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'E-mail ou senha incorretos.'
      });
    }

    console.log('✅ Login realizado:', usuario.email);

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email
      }
    });
  } catch (err) {
    console.error('❌ Erro no login:', err);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno no servidor ao processar o login.'
    });
  }
});


// =====================================================
// BUSCAR USUÁRIO POR ID
// =====================================================

app.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      `SELECT id_usuario, email, criado_em FROM Usuario WHERE id_usuario = ?`,
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    return res.json(results[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar usuário:', err);
    return res.status(500).json({ mensagem: 'Erro no servidor ao buscar usuário.' });
  }
});


// =====================================================
// CARDÁPIO - CRUD COMPLETO
// =====================================================

// GET - Buscar todo o cardápio com informações de dia e refeição
app.get('/cardapio', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        c.id_cardapio,
        c.comida,
        c.fk_id_horario,
        h.id_horario,
        h.hora,
        h.dia
      FROM Cardapio c
      INNER JOIN Horario h
        ON c.fk_id_horario = h.id_horario
      ORDER BY h.dia ASC, h.hora ASC, c.id_cardapio ASC
    `);

    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erro ao buscar cardápio:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar cardápio.' });
  }
});

// GET - Buscar opções disponíveis de alimentos
app.get('/cardapio/opcoes', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT id_opcao, refeicao_id, nome
      FROM OpcaoAlimento
      ORDER BY refeicao_id ASC, nome ASC
    `);
    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erro ao buscar opções de alimentos:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar opções de alimentos.' });
  }
});

// POST - Adicionar nova opção de alimento para uma refeição
app.post('/cardapio/opcoes', async (req, res) => {
  const { refeicao_id, nome } = req.body;

  if (!refeicao_id || !nome || !nome.trim()) {
    return res.status(400).json({ mensagem: 'Refeição e nome do alimento são obrigatórios.' });
  }

  try {
    const [result] = await db.query(
      `INSERT IGNORE INTO OpcaoAlimento (refeicao_id, nome) VALUES (?, ?)`,
      [refeicao_id, nome.trim()]
    );

    return res.status(201).json({
      mensagem: 'Opção de alimento registrada com sucesso!',
      id_opcao: result.insertId
    });
  } catch (err) {
    console.error('❌ Erro ao cadastrar opção de alimento:', err);
    return res.status(500).json({ mensagem: 'Erro ao cadastrar opção de alimento.' });
  }
});

// GET - Buscar item específico por ID (registrado antes de /:dia para evitar colisão)
app.get('/cardapio/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(`
      SELECT
        c.id_cardapio,
        c.comida,
        c.fk_id_horario,
        h.id_horario,
        h.hora,
        h.dia
      FROM Cardapio c
      INNER JOIN Horario h
        ON c.fk_id_horario = h.id_horario
      WHERE c.id_cardapio = ?
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Item do cardápio não encontrado.' });
    }

    return res.status(200).json(results[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar item do cardápio:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar item do cardápio.' });
  }
});

// GET - Buscar cardápio por data (ex: /cardapio/2026-09-18)
app.get('/cardapio/:dia', async (req, res) => {
  const { dia } = req.params;

  try {
    const [results] = await db.query(`
      SELECT
        c.id_cardapio,
        c.comida,
        c.fk_id_horario,
        h.id_horario,
        h.hora,
        h.dia
      FROM Cardapio c
      INNER JOIN Horario h
        ON c.fk_id_horario = h.id_horario
      WHERE h.dia = ?
      ORDER BY h.hora ASC, c.id_cardapio ASC
    `, [dia]);

    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erro ao buscar cardápio por data:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar cardápio.' });
  }
});

// POST - Salvar seleção completa de alimentos para uma refeição de um dia (Atomic Sync)
app.post('/cardapio/refeicao', async (req, res) => {
  const { dia, hora, comidas } = req.body;

  if (!dia || hora === undefined || !Array.isArray(comidas)) {
    return res.status(400).json({
      mensagem: 'Informe o dia, o horário/refeição e a lista de comidas.'
    });
  }

  try {
    // 1. Busca ou cria o Horario
    let [horarios] = await db.query(
      `SELECT id_horario FROM Horario WHERE dia = ? AND hora = ?`,
      [dia, hora]
    );

    let idHorario;
    if (horarios.length === 0) {
      const [insertH] = await db.query(
        `INSERT INTO Horario (dia, hora) VALUES (?, ?)`,
        [dia, hora]
      );
      idHorario = insertH.insertId;
    } else {
      idHorario = horarios[0].id_horario;
    }

    // 2. Remove os itens antigos daquela refeição/dia
    await db.query(`DELETE FROM Cardapio WHERE fk_id_horario = ?`, [idHorario]);

    // 3. Insere os novos itens
    for (const comida of comidas) {
      if (typeof comida === 'string' && comida.trim()) {
        await db.query(
          `INSERT INTO Cardapio (comida, fk_id_horario) VALUES (?, ?)`,
          [comida.trim(), idHorario]
        );
      }
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Cardápio da refeição atualizado com sucesso!',
      id_horario: idHorario,
      total_itens: comidas.length
    });
  } catch (err) {
    console.error('❌ Erro ao salvar refeição do cardápio:', err);
    return res.status(500).json({ mensagem: 'Erro ao salvar refeição do cardápio.' });
  }
});

// POST - Cadastrar item individual no cardápio
app.post('/cardapio', async (req, res) => {
  const { comida, fk_id_horario, dia, hora } = req.body;

  if (!comida || (!fk_id_horario && (!dia || hora === undefined))) {
    return res.status(400).json({
      mensagem: 'Comida e horário (ou dia e hora) são obrigatórios.'
    });
  }

  try {
    let horarioId = fk_id_horario;

    if (!horarioId) {
      let [horarios] = await db.query(
        `SELECT id_horario FROM Horario WHERE dia = ? AND hora = ?`,
        [dia, hora]
      );
      if (horarios.length === 0) {
        const [insertH] = await db.query(
          `INSERT INTO Horario (dia, hora) VALUES (?, ?)`,
          [dia, hora]
        );
        horarioId = insertH.insertId;
      } else {
        horarioId = horarios[0].id_horario;
      }
    }

    const [result] = await db.query(
      `INSERT INTO Cardapio (comida, fk_id_horario) VALUES (?, ?)`,
      [comida.trim(), horarioId]
    );

    return res.status(201).json({
      mensagem: 'Item adicionado ao cardápio com sucesso!',
      id_cardapio: result.insertId
    });
  } catch (err) {
    console.error('❌ Erro ao cadastrar item:', err);
    return res.status(500).json({ mensagem: 'Erro ao cadastrar item no cardápio.' });
  }
});

// PUT - Atualizar item do cardápio
app.put('/cardapio/:id', async (req, res) => {
  const { id } = req.params;
  const { comida, fk_id_horario } = req.body;

  if (!comida) {
    return res.status(400).json({ mensagem: 'O campo comida é obrigatório.' });
  }

  try {
    const [item] = await db.query(`SELECT id_cardapio FROM Cardapio WHERE id_cardapio = ?`, [id]);
    if (item.length === 0) {
      return res.status(404).json({ mensagem: 'Item do cardápio não encontrado.' });
    }

    if (fk_id_horario) {
      await db.query(
        `UPDATE Cardapio SET comida = ?, fk_id_horario = ? WHERE id_cardapio = ?`,
        [comida.trim(), fk_id_horario, id]
      );
    } else {
      await db.query(
        `UPDATE Cardapio SET comida = ? WHERE id_cardapio = ?`,
        [comida.trim(), id]
      );
    }

    return res.status(200).json({ mensagem: 'Item do cardápio atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar item:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar item do cardápio.' });
  }
});

// DELETE - Excluir item do cardápio
app.delete('/cardapio/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM Cardapio WHERE id_cardapio = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Item do cardápio não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Item removido do cardápio com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao excluir item:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir item do cardápio.' });
  }
});


// =====================================================
// AVISOS - CRUD COMPLETO
// =====================================================

// GET - Buscar todos os avisos
app.get('/avisos', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        id_aviso,
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante,
        publicado,
        criado_em
      FROM Aviso
      ORDER BY data DESC, horario_comeco ASC, id_aviso DESC
    `);

    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erro ao buscar avisos:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar avisos.' });
  }
});

// GET - Buscar aviso específico
app.get('/avisos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(`
      SELECT
        id_aviso,
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante,
        publicado,
        criado_em
      FROM Aviso
      WHERE id_aviso = ?
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Aviso não encontrado.' });
    }

    return res.status(200).json(results[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar aviso:', err);
    return res.status(500).json({ mensagem: 'Erro no servidor ao buscar aviso.' });
  }
});

// POST - Criar novo aviso
app.post('/avisos', async (req, res) => {
  const {
    titulo,
    categoria,
    descricao,
    data,
    horario_comeco,
    horario_final,
    evento_dia,
    importante,
    publicado
  } = req.body;

  if (!titulo || !categoria || !descricao || !data) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios (título, categoria, descrição e data).'
    });
  }

  const hoje = new Date().toISOString().slice(0, 10);

  try {
    const [result] = await db.query(`
      INSERT INTO Aviso (
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante,
        publicado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      titulo.trim(),
      categoria.trim(),
      descricao.trim(),
      data,
      horario_comeco || null,
      horario_final || null,
      evento_dia ? true : false,
      importante ? true : false,
      publicado || hoje
    ]);

    return res.status(201).json({
      mensagem: 'Aviso criado com sucesso!',
      id_aviso: result.insertId
    });
  } catch (err) {
    console.error('❌ Erro ao criar aviso:', err);
    return res.status(500).json({ mensagem: 'Erro ao criar aviso.' });
  }
});

// PUT - Atualizar aviso
app.put('/avisos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    categoria,
    descricao,
    data,
    horario_comeco,
    horario_final,
    evento_dia,
    importante
  } = req.body;

  if (!titulo || !categoria || !descricao || !data) {
    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios (título, categoria, descrição e data).'
    });
  }

  try {
    const [result] = await db.query(`
      UPDATE Aviso SET
        titulo = ?,
        categoria = ?,
        descricao = ?,
        data = ?,
        horario_comeco = ?,
        horario_final = ?,
        evento_dia = ?,
        importante = ?
      WHERE id_aviso = ?
    `, [
      titulo.trim(),
      categoria.trim(),
      descricao.trim(),
      data,
      horario_comeco || null,
      horario_final || null,
      evento_dia ? true : false,
      importante ? true : false,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Aviso não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Aviso atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar aviso:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar aviso.' });
  }
});

// DELETE - Excluir aviso
app.delete('/avisos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM Aviso WHERE id_aviso = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Aviso não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Aviso excluído com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao excluir aviso:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir aviso.' });
  }
});


// =====================================================
// CALENDÁRIO / EVENTOS - CRUD COMPLETO
// =====================================================

// GET - Buscar todos os eventos
app.get('/eventos', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        id_evento,
        titulo,
        descricao,
        categoria,
        cor,
        data,
        horario,
        local,
        criado_em
      FROM Evento
      ORDER BY data ASC, horario ASC
    `);

    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erro ao buscar eventos:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar eventos.' });
  }
});

// GET - Buscar evento por ID
app.get('/eventos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(`
      SELECT
        id_evento,
        titulo,
        descricao,
        categoria,
        cor,
        data,
        horario,
        local,
        criado_em
      FROM Evento
      WHERE id_evento = ?
    `, [id]);

    if (results.length === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }

    return res.status(200).json(results[0]);
  } catch (err) {
    console.error('❌ Erro ao buscar evento:', err);
    return res.status(500).json({ mensagem: 'Erro no servidor ao buscar evento.' });
  }
});

// POST - Criar novo evento
app.post('/eventos', async (req, res) => {
  const {
    titulo,
    descricao,
    categoria,
    cor,
    data,
    horario,
    local
  } = req.body;

  if (!titulo || !descricao || !categoria || !data || !horario || !local) {
    return res.status(400).json({
      mensagem: 'Preencha título, descrição, categoria, data, horário e local.'
    });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO Evento (
        titulo,
        descricao,
        categoria,
        cor,
        data,
        horario,
        local
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      titulo.trim(),
      descricao.trim(),
      categoria.trim(),
      cor || 'azul',
      data,
      horario.trim(),
      local.trim()
    ]);

    return res.status(201).json({
      mensagem: 'Evento criado com sucesso!',
      id_evento: result.insertId
    });
  } catch (err) {
    console.error('❌ Erro ao criar evento:', err);
    return res.status(500).json({ mensagem: 'Erro ao criar evento.' });
  }
});

// PUT - Atualizar evento
app.put('/eventos/:id', async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descricao,
    categoria,
    cor,
    data,
    horario,
    local
  } = req.body;

  if (!titulo || !descricao || !categoria || !data || !horario || !local) {
    return res.status(400).json({
      mensagem: 'Preencha título, descrição, categoria, data, horário e local.'
    });
  }

  try {
    const [result] = await db.query(`
      UPDATE Evento SET
        titulo = ?,
        descricao = ?,
        categoria = ?,
        cor = ?,
        data = ?,
        horario = ?,
        local = ?
      WHERE id_evento = ?
    `, [
      titulo.trim(),
      descricao.trim(),
      categoria.trim(),
      cor || 'azul',
      data,
      horario.trim(),
      local.trim(),
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Evento atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar evento:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar evento.' });
  }
});

// DELETE - Excluir evento
app.delete('/eventos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(`DELETE FROM Evento WHERE id_evento = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Evento excluído com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao excluir evento:', err);
    return res.status(500).json({ mensagem: 'Erro ao excluir evento.' });
  }
});


// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota [${req.method}] ${req.url} não encontrada.`
  });
});

// Middleware global para captura de exceções
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado no Express:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno no servidor.'
  });
});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORTA = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.initDb();

    const server = app.listen(PORTA, () => {
      console.log('======================================');
      console.log('🚀 Backend Monsenhor Bicudo Conectado!');
      console.log(`🌐 Servidor ativo em: http://localhost:${PORTA}`);
      console.log('======================================');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ ERRO: A porta ${PORTA} já está em uso por outro processo!`);
        console.error(`💡 Dica: Finalize o processo anterior que está utilizando a porta ${PORTA} ou inicie em outra porta (ex: PORT=3001 node server.js).\n`);
      } else {
        console.error('❌ Erro ao iniciar servidor HTTP:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Falha crítica ao inicializar o servidor:', err.message || err);
    process.exit(1);
  }
}

startServer();
