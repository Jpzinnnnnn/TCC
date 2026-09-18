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
    message: 'Backend Monsenhor Bicudo funcionando!'
  });
});


// =====================================================
// LOGIN
// =====================================================

app.post('/login', async (req, res) => {

  console.log('📥 Login recebido:', req.body);

  const { email, senha } = req.body;

  // Verifica se os campos foram preenchidos
  if (!email || !senha) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Preencha o e-mail e a senha.'
    });
  }

  try {

    // Procura o único usuário pelo e-mail
    const [results] = await db.query(
      `
      SELECT
        id_usuario,
        email,
        senha
      FROM Usuario
      WHERE email = ?
      `,
      [email]
    );


    // Usuário não encontrado
    if (results.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'E-mail ou senha incorretos.'
      });
    }


    const usuario = results[0];


    // Compara a senha digitada
    // com a senha criptografada no banco
    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );


    // Senha incorreta
    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'E-mail ou senha incorretos.'
      });
    }


    // Login realizado
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
      mensagem: 'Erro interno no servidor.'
    });
  }

});


// =====================================================
// BUSCAR USUÁRIO
// =====================================================

app.get('/usuario/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const [results] = await db.query(
      `
      SELECT
        id_usuario,
        email
      FROM Usuario
      WHERE id_usuario = ?
      `,
      [id]
    );


    if (results.length === 0) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado.'
      });
    }


    return res.json(results[0]);

  } catch (err) {

    console.error('❌ Erro ao buscar usuário:', err);

    return res.status(500).json({
      mensagem: 'Erro no servidor.'
    });
  }

});


// =====================================================
// CARDÁPIO - CRUD COMPLETO
// =====================================================


// =====================================================
// GET - BUSCAR TODO O CARDÁPIO
// =====================================================

app.get('/cardapio', async (req, res) => {

  try {

    const [results] = await db.query(`
      SELECT
        c.id_cardapio,
        c.comida,
        h.id_horario,
        h.hora,
        h.dia
      FROM Cardapio c
      INNER JOIN Horario h
        ON c.fk_id_horario = h.id_horario
      ORDER BY h.dia ASC, h.hora ASC
    `);

    return res.status(200).json(results);

  } catch (err) {

    console.error('❌ Erro ao buscar cardápio:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar cardápio.'
    });

  }

});


// =====================================================
// GET - BUSCAR CARDÁPIO POR DATA
// Exemplo: /cardapio/2026-09-18
// =====================================================

app.get('/cardapio/:dia', async (req, res) => {

  const { dia } = req.params;

  try {

    const [results] = await db.query(`
      SELECT
        c.id_cardapio,
        c.comida,
        h.id_horario,
        h.hora,
        h.dia
      FROM Cardapio c
      INNER JOIN Horario h
        ON c.fk_id_horario = h.id_horario
      WHERE h.dia = ?
      ORDER BY h.hora ASC
    `, [dia]);

    return res.status(200).json(results);

  } catch (err) {

    console.error('❌ Erro ao buscar cardápio por data:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar cardápio.'
    });

  }

});


// =====================================================
// GET - BUSCAR CARDÁPIO POR ID
// Exemplo: /cardapio/id/1
// =====================================================

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

      return res.status(404).json({
        mensagem: 'Item do cardápio não encontrado.'
      });

    }


    return res.status(200).json(results[0]);

  } catch (err) {

    console.error('❌ Erro ao buscar item do cardápio:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar item do cardápio.'
    });

  }

});


// =====================================================
// POST - CADASTRAR ITEM NO CARDÁPIO
// =====================================================
//
// JSON esperado:
//
// {
//   "comida": "Arroz, feijão e frango",
//   "fk_id_horario": 1
// }
//
// =====================================================

app.post('/cardapio', async (req, res) => {

  const {
    comida,
    fk_id_horario
  } = req.body;


  // Validação

  if (!comida || !fk_id_horario) {

    return res.status(400).json({
      mensagem: 'Comida e horário são obrigatórios.'
    });

  }


  try {

    // Verifica se o horário existe

    const [horario] = await db.query(
      `
      SELECT id_horario
      FROM Horario
      WHERE id_horario = ?
      `,
      [fk_id_horario]
    );


    if (horario.length === 0) {

      return res.status(404).json({
        mensagem: 'Horário não encontrado.'
      });

    }


    // Insere o item

    const [result] = await db.query(
      `
      INSERT INTO Cardapio
      (comida, fk_id_horario)
      VALUES (?, ?)
      `,
      [
        comida,
        fk_id_horario
      ]
    );


    return res.status(201).json({
      mensagem: 'Item adicionado ao cardápio com sucesso!',
      id_cardapio: result.insertId
    });


  } catch (err) {

    console.error('❌ Erro ao cadastrar item:', err);

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar item no cardápio.'
    });

  }

});


// =====================================================
// PUT - ATUALIZAR ITEM DO CARDÁPIO
// =====================================================
//
// Exemplo:
//
// PUT /cardapio/1
//
// JSON:
//
// {
//   "comida": "Arroz, feijão, carne e salada",
//   "fk_id_horario": 2
// }
//
// =====================================================

app.put('/cardapio/:id', async (req, res) => {

  const { id } = req.params;

  const {
    comida,
    fk_id_horario
  } = req.body;


  // Validação

  if (!comida || !fk_id_horario) {

    return res.status(400).json({
      mensagem: 'Comida e horário são obrigatórios.'
    });

  }


  try {

    // Verifica se o item existe

    const [item] = await db.query(
      `
      SELECT id_cardapio
      FROM Cardapio
      WHERE id_cardapio = ?
      `,
      [id]
    );


    if (item.length === 0) {

      return res.status(404).json({
        mensagem: 'Item do cardápio não encontrado.'
      });

    }


    // Verifica se o novo horário existe

    const [horario] = await db.query(
      `
      SELECT id_horario
      FROM Horario
      WHERE id_horario = ?
      `,
      [fk_id_horario]
    );


    if (horario.length === 0) {

      return res.status(404).json({
        mensagem: 'Horário não encontrado.'
      });

    }


    // Atualiza

    await db.query(
      `
      UPDATE Cardapio
      SET
        comida = ?,
        fk_id_horario = ?
      WHERE id_cardapio = ?
      `,
      [
        comida,
        fk_id_horario,
        id
      ]
    );


    return res.status(200).json({
      mensagem: 'Item do cardápio atualizado com sucesso!'
    });


  } catch (err) {

    console.error('❌ Erro ao atualizar item:', err);

    return res.status(500).json({
      mensagem: 'Erro ao atualizar item do cardápio.'
    });

  }

});


// =====================================================
// DELETE - EXCLUIR ITEM DO CARDÁPIO
// =====================================================
//
// Exemplo:
//
// DELETE /cardapio/1
//
// =====================================================

app.delete('/cardapio/:id', async (req, res) => {

  const { id } = req.params;


  try {

    // Verifica se o item existe

    const [item] = await db.query(
      `
      SELECT id_cardapio
      FROM Cardapio
      WHERE id_cardapio = ?
      `,
      [id]
    );


    if (item.length === 0) {

      return res.status(404).json({
        mensagem: 'Item do cardápio não encontrado.'
      });

    }


    // Exclui

    await db.query(
      `
      DELETE FROM Cardapio
      WHERE id_cardapio = ?
      `,
      [id]
    );


    return res.status(200).json({
      mensagem: 'Item removido do cardápio com sucesso!'
    });


  } catch (err) {

    console.error('❌ Erro ao excluir item:', err);

    return res.status(500).json({
      mensagem: 'Erro ao excluir item do cardápio.'
    });

  }

});

// =====================================================
// AVISOS
// =====================================================


// Buscar todos os avisos
app.get('/avisos', async (req, res) => {

  try {

    const [results] = await db.query(
      `
      SELECT
        id_aviso,
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante
      FROM Aviso
      ORDER BY data DESC, horario_comeco ASC
      `
    );


    return res.json(results);

  } catch (err) {

    console.error('❌ Erro ao buscar avisos:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar avisos.'
    });

  }

});


// Buscar um aviso específico
app.get('/avisos/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const [results] = await db.query(
      `
      SELECT
        id_aviso,
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante
      FROM Aviso
      WHERE id_aviso = ?
      `,
      [id]
    );


    if (results.length === 0) {
      return res.status(404).json({
        mensagem: 'Aviso não encontrado.'
      });
    }


    return res.json(results[0]);

  } catch (err) {

    console.error('❌ Erro ao buscar aviso:', err);

    return res.status(500).json({
      mensagem: 'Erro no servidor.'
    });

  }

});


// =====================================================
// CRIAR AVISO
// =====================================================

app.post('/avisos', async (req, res) => {

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
      mensagem: 'Preencha todos os campos obrigatórios.'
    });

  }


  try {

    const [result] = await db.query(
      `
      INSERT INTO Aviso
      (
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco,
        horario_final,
        evento_dia,
        importante
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco || null,
        horario_final || null,
        evento_dia || false,
        importante || false
      ]
    );


    console.log('✅ Aviso criado:', result.insertId);


    return res.status(201).json({
      mensagem: 'Aviso criado com sucesso!',
      id_aviso: result.insertId
    });

  } catch (err) {

    console.error('❌ Erro ao criar aviso:', err);

    return res.status(500).json({
      mensagem: 'Erro ao criar aviso.'
    });

  }

});


// =====================================================
// ATUALIZAR AVISO
// =====================================================

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


  try {

    const [result] = await db.query(
      `
      UPDATE Aviso
      SET
        titulo = ?,
        categoria = ?,
        descricao = ?,
        data = ?,
        horario_comeco = ?,
        horario_final = ?,
        evento_dia = ?,
        importante = ?
      WHERE id_aviso = ?
      `,
      [
        titulo,
        categoria,
        descricao,
        data,
        horario_comeco || null,
        horario_final || null,
        evento_dia || false,
        importante || false,
        id
      ]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        mensagem: 'Aviso não encontrado.'
      });

    }


    return res.json({
      mensagem: 'Aviso atualizado com sucesso!'
    });

  } catch (err) {

    console.error('❌ Erro ao atualizar aviso:', err);

    return res.status(500).json({
      mensagem: 'Erro ao atualizar aviso.'
    });

  }

});


// =====================================================
// EXCLUIR AVISO
// =====================================================

app.delete('/avisos/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const [result] = await db.query(
      `
      DELETE FROM Aviso
      WHERE id_aviso = ?
      `,
      [id]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        mensagem: 'Aviso não encontrado.'
      });

    }


    return res.json({
      mensagem: 'Aviso excluído com sucesso!'
    });

  } catch (err) {

    console.error('❌ Erro ao excluir aviso:', err);

    return res.status(500).json({
      mensagem: 'Erro ao excluir aviso.'
    });

  }

});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

const PORTA = 3000;

app.listen(PORTA, () => {

  console.log('======================================');
  console.log('🚀 Backend Monsenhor Bicudo');
  console.log(`🌐 Servidor: http://localhost:${PORTA}`);
  console.log('======================================');

}); 
