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
// CARDÁPIO
// =====================================================


// Buscar todo o cardápio
app.get('/cardapio', async (req, res) => {

  try {

    const [results] = await db.query(
      `
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
      `
    );


    return res.json(results);

  } catch (err) {

    console.error('❌ Erro ao buscar cardápio:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar cardápio.'
    });

  }

});


// Buscar cardápio de uma determinada data
app.get('/cardapio/:dia', async (req, res) => {

  const { dia } = req.params;

  try {

    const [results] = await db.query(
      `
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
      `,
      [dia]
    );


    return res.json(results);

  } catch (err) {

    console.error('❌ Erro ao buscar cardápio:', err);

    return res.status(500).json({
      mensagem: 'Erro ao buscar cardápio.'
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
